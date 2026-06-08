using System.Security.Cryptography;
using System.Text;
using Asp.Versioning;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Yvy.Infrastructure.Inbound;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Api.Endpoints.Webhooks;

/// <summary>
/// The single public, untrusted entrypoint: Microsoft Graph posts mailbox change notifications here
/// (email-ingestion-spec §3). Anonymous (Graph is unauthenticated to us) but protected by a
/// <c>clientState</c> shared secret. Responds fast — persists to the durable queue and returns 202;
/// no Graph calls happen in the request (those run in <c>ProcessInboundEmailsJob</c>).
/// </summary>
public sealed class GraphEmailWebhookEndpoints : IEndpoint
{
    // Cap untrusted batch size; real Graph batches are small. Defends against abuse of a public route.
    private const int MaxBatchSize = 100;

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.NewVersionedApi()
            .MapGroup("/api/v{version:apiVersion}/webhooks/graph")
            .HasApiVersion(new ApiVersion(1, 0))
            .RequireRateLimiting("api")
            .AllowAnonymous()
            .WithTags("Webhooks");

        group.MapPost("/email", ReceiveNotifications)
            .WithName("GraphEmailWebhook")
            .WithSummary("Receive Microsoft Graph email change notifications")
            .Accepts<GraphNotificationBatch>("application/json")
            .Produces(StatusCodes.Status202Accepted)
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        // Convenience GET handshake for manual verification (Graph itself validates via POST).
        group.MapGet("/email", (string? validationToken) =>
                string.IsNullOrEmpty(validationToken)
                    ? Results.BadRequest()
                    : Results.Text(validationToken, "text/plain", Encoding.UTF8))
            .WithName("GraphEmailWebhookValidation")
            .WithSummary("Microsoft Graph subscription validation handshake")
            .ExcludeFromDescription();
    }

    private static async Task<IResult> ReceiveNotifications(
        HttpContext http,
        string? validationToken,
        IOptions<MicrosoftGraphOptions> options,
        YvyDbContext db,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("GraphEmailWebhook");

        // 1. Subscription validation handshake — echo the token as text/plain, 200, promptly.
        if (!string.IsNullOrEmpty(validationToken))
            return Results.Text(validationToken, "text/plain", Encoding.UTF8);

        // 2. Change notifications. Treat the body as hostile.
        GraphNotificationBatch? batch;
        try
        {
            batch = await http.Request.ReadFromJsonAsync<GraphNotificationBatch>(ct);
        }
        catch
        {
            return Results.BadRequest();
        }

        if (batch?.Value is null || batch.Value.Count == 0)
            return Results.Accepted();

        if (batch.Value.Count > MaxBatchSize)
        {
            logger.LogWarning("Rejected oversized Graph notification batch ({Count} items)", batch.Value.Count);
            return Results.BadRequest();
        }

        // 3. Validate clientState on EVERY item (constant-time) before persisting anything.
        var expected = options.Value.ClientState;
        if (batch.Value.Any(item => !IsValidClientState(item.ClientState, expected)))
        {
            logger.LogWarning("Rejected Graph notification batch with invalid clientState");
            return Results.Unauthorized();
        }

        // 4. Upsert one notification per distinct MessageId. The unique index is the final dedup guard.
        var ids = batch.Value
            .Select(i => i.ResourceData?.Id)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return Results.Accepted();

        var seen = (await db.InboundEmailNotifications
                .Where(n => ids.Contains(n.MessageId))
                .Select(n => n.MessageId)
                .ToListAsync(ct))
            .ToHashSet();

        foreach (var item in batch.Value)
        {
            var messageId = item.ResourceData?.Id;
            if (string.IsNullOrWhiteSpace(messageId) || !seen.Add(messageId))
                continue;

            db.InboundEmailNotifications.Add(new InboundEmailNotification
            {
                Id = Guid.NewGuid(),
                MessageId = messageId,
                SubscriptionId = item.SubscriptionId,
                ReceivedAt = DateTime.UtcNow,
            });
        }

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Concurrent delivery already inserted the same MessageId (unique index). Idempotent — 202.
            logger.LogInformation("Concurrent duplicate Graph notification ignored");
        }

        return Results.Accepted();
    }

    /// <summary>Constant-time comparison of the notification's clientState against the configured secret.</summary>
    private static bool IsValidClientState(string? provided, string expected)
    {
        if (string.IsNullOrEmpty(expected))
            return false; // misconfigured — never accept when no secret is set.

        var a = Encoding.UTF8.GetBytes(provided ?? string.Empty);
        var b = Encoding.UTF8.GetBytes(expected);
        return CryptographicOperations.FixedTimeEquals(a, b);
    }
}
