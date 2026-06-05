using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Yvy.Api.IntegrationTests.Infrastructure;
using Yvy.Domain.Aggregates.Kanban;
using Yvy.Infrastructure.Inbound;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Api.IntegrationTests.Webhooks;

/// <summary>
/// End-to-end coverage of the email-ingestion slice against the simulated gateway (no live Graph):
/// the four cases from email-ingestion-spec §9 — validation handshake, valid notification → card,
/// wrong clientState → rejected, and replay → exactly one card.
/// </summary>
public sealed class GraphEmailWebhookTests : IClassFixture<YvyApiFactory>, IAsyncLifetime
{
    private const string WebhookUrl = "/api/v1/webhooks/graph/email";

    private readonly YvyApiFactory _factory;
    private readonly HttpClient _client; // anonymous — Graph is unauthenticated to us

    public GraphEmailWebhookTests(YvyApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GET_handshake_EchoesValidationToken_AsPlainText()
    {
        var response = await _client.GetAsync($"{WebhookUrl}?validationToken=abc123");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("text/plain");
        (await response.Content.ReadAsStringAsync()).Should().Be("abc123");
    }

    [Fact]
    public async Task POST_handshake_EchoesValidationToken_AsPlainText()
    {
        // Microsoft Graph issues the validation handshake as a POST with the token on the query string.
        var response = await _client.PostAsync($"{WebhookUrl}?validationToken=xyz789", content: null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("text/plain");
        (await response.Content.ReadAsStringAsync()).Should().Be("xyz789");
    }

    [Fact]
    public async Task POST_validNotification_CreatesCardInRecebido()
    {
        const string messageId = "AAMkmessage-valid-001";

        var response = await _client.PostAsJsonAsync(
            WebhookUrl, Notification(messageId, YvyApiFactory.GraphClientState));

        response.StatusCode.Should().Be(HttpStatusCode.Accepted);

        await ProcessInboundEmailsAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();

        var cards = await db.KanbanCards.ToListAsync();
        cards.Should().ContainSingle();
        cards[0].Phase.Should().Be(CardPhase.Recebido);
        cards[0].ProcessType.Should().Be(ProcessType.ContasAPagar);
        cards[0].Email.MessageId.Should().Be(messageId);
    }

    [Fact]
    public async Task POST_wrongClientState_IsRejected_AndCreatesNoCard()
    {
        const string messageId = "AAMkmessage-evil-002";

        var response = await _client.PostAsJsonAsync(
            WebhookUrl, Notification(messageId, "totally-wrong-secret"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        await ProcessInboundEmailsAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();

        (await db.InboundEmailNotifications.CountAsync()).Should().Be(0);
        (await db.KanbanCards.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task POST_sameNotificationTwice_CreatesExactlyOneCard()
    {
        const string messageId = "AAMkmessage-replay-003";
        var payload = Notification(messageId, YvyApiFactory.GraphClientState);

        var first = await _client.PostAsJsonAsync(WebhookUrl, payload);
        var second = await _client.PostAsJsonAsync(WebhookUrl, payload);

        first.StatusCode.Should().Be(HttpStatusCode.Accepted);
        second.StatusCode.Should().Be(HttpStatusCode.Accepted);

        // Process twice too — the whole pipeline must stay idempotent on the Graph MessageId.
        await ProcessInboundEmailsAsync();
        await ProcessInboundEmailsAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();

        (await db.InboundEmailNotifications.CountAsync(n => n.MessageId == messageId)).Should().Be(1);
        (await db.KanbanCards.CountAsync(c => c.Email.MessageId == messageId)).Should().Be(1);
    }

    /// <summary>Drives the ingestion job deterministically instead of waiting on the Quartz timer.</summary>
    private async Task ProcessInboundEmailsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var job = ActivatorUtilities.CreateInstance<ProcessInboundEmailsJob>(scope.ServiceProvider);
        await job.ProcessBatchAsync();
    }

    private static object Notification(string messageId, string clientState) => new
    {
        value = new[]
        {
            new
            {
                subscriptionId = "sub-test-1",
                clientState,
                changeType = "created",
                resource = "users/financeiro@yvy.capital/messages/" + messageId,
                resourceData = new { id = messageId },
            },
        },
    };
}
