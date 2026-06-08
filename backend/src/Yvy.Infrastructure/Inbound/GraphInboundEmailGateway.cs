using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Azure.Core;
using Azure.Identity;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Yvy.Application.Abstractions;
using Yvy.Application.KanbanCards.DTOs;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Production <see cref="IInboundEmailGateway"/>: a typed <see cref="HttpClient"/> against Microsoft
/// Graph v1.0 with app-only (client-credentials) auth and the <c>Mail.Read</c> application permission
/// (email-ingestion-spec §2/§6). Built now, inert until <c>MicrosoftGraph:Enabled</c> is true and
/// credentials are provisioned. Maps Graph JSON to plain application DTOs so no SDK type leaks out.
/// </summary>
/// <remarks>
/// Graph endpoints, subscription resource paths and expiry limits are CONFIRM-against-docs items
/// (source-driven-development) — verify before going live.
/// </remarks>
public sealed class GraphInboundEmailGateway : IInboundEmailGateway
{
    private static readonly string[] GraphScopes = ["https://graph.microsoft.com/.default"];

    private readonly HttpClient _http;
    private readonly MicrosoftGraphOptions _options;
    private readonly ILogger<GraphInboundEmailGateway> _logger;
    private readonly TokenCredential _credential;

    public GraphInboundEmailGateway(
        HttpClient http,
        IOptions<MicrosoftGraphOptions> options,
        ILogger<GraphInboundEmailGateway> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _credential = new ClientSecretCredential(_options.TenantId, _options.ClientId, _options.ClientSecret);
    }

    // The mailbox inbox messages resource — used both for fetching and as the subscription target.
    private string InboxMessagesResource => $"users/{_options.MailboxAddress}/mailFolders('Inbox')/messages";

    public async Task<ErrorOr<InboundEmailMessage>> GetMessageAsync(string messageId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(messageId))
            return Error.Validation("InboundEmail.MissingMessageId", "A message id is required.");

        // Select only the fields we map — avoids pulling full bodies (PII) we don't store.
        var url = $"users/{_options.MailboxAddress}/messages/{Uri.EscapeDataString(messageId)}" +
                  "?$select=id,from,subject,receivedDateTime,bodyPreview";

        var response = await SendAsync(HttpMethod.Get, url, content: null, ct);
        if (response.IsError) return response.Errors;

        using var doc = JsonDocument.Parse(response.Value);
        var root = doc.RootElement;

        var from = root.TryGetProperty("from", out var fromEl)
            && fromEl.TryGetProperty("emailAddress", out var addrEl)
            && addrEl.TryGetProperty("address", out var addrVal)
                ? addrVal.GetString() ?? string.Empty
                : string.Empty;

        return new InboundEmailMessage(
            MessageId: root.GetProperty("id").GetString() ?? messageId,
            From: from,
            Subject: root.TryGetProperty("subject", out var subj) ? subj.GetString() ?? string.Empty : string.Empty,
            ReceivedAt: root.TryGetProperty("receivedDateTime", out var rcv) ? rcv.GetDateTime() : DateTime.UtcNow,
            BodyPreview: root.TryGetProperty("bodyPreview", out var bp) ? bp.GetString() : null,
            RawBodyRef: null);
    }

    public async Task<ErrorOr<IReadOnlyList<GraphSubscription>>> ListSubscriptionsAsync(CancellationToken ct = default)
    {
        // App-only context returns only subscriptions created by this app registration.
        var response = await SendAsync(HttpMethod.Get, "subscriptions", content: null, ct);
        if (response.IsError) return response.Errors;

        using var doc = JsonDocument.Parse(response.Value);
        var list = new List<GraphSubscription>();
        if (doc.RootElement.TryGetProperty("value", out var values))
        {
            foreach (var item in values.EnumerateArray())
                list.Add(MapSubscription(item));
        }

        return list;
    }

    public async Task<ErrorOr<GraphSubscription>> CreateSubscriptionAsync(CancellationToken ct = default)
    {
        var body = new
        {
            changeType = "created",
            notificationUrl = _options.NotificationUrl,
            resource = InboxMessagesResource,
            clientState = _options.ClientState,
            expirationDateTime = DateTime.UtcNow.AddMinutes(_options.SubscriptionExpirationMinutes),
        };

        var response = await SendAsync(HttpMethod.Post, "subscriptions", JsonContent.Create(body), ct);
        if (response.IsError) return response.Errors;

        using var doc = JsonDocument.Parse(response.Value);
        return MapSubscription(doc.RootElement);
    }

    public async Task<ErrorOr<GraphSubscription>> RenewSubscriptionAsync(string subscriptionId, CancellationToken ct = default)
    {
        var body = new { expirationDateTime = DateTime.UtcNow.AddMinutes(_options.SubscriptionExpirationMinutes) };

        var response = await SendAsync(
            HttpMethod.Patch, $"subscriptions/{subscriptionId}", JsonContent.Create(body), ct);
        if (response.IsError) return response.Errors;

        using var doc = JsonDocument.Parse(response.Value);
        return MapSubscription(doc.RootElement);
    }

    public async Task DeleteSubscriptionAsync(string subscriptionId, CancellationToken ct = default)
    {
        var result = await SendAsync(HttpMethod.Delete, $"subscriptions/{subscriptionId}", content: null, ct);
        if (result.IsError)
            _logger.LogWarning("Failed to delete Graph subscription {SubscriptionId}", subscriptionId);
    }

    /// <summary>Sends an authenticated Graph request and returns the body string, or a mapped error.</summary>
    private async Task<ErrorOr<string>> SendAsync(
        HttpMethod method, string relativeUrl, HttpContent? content, CancellationToken ct)
    {
        try
        {
            using var request = new HttpRequestMessage(method, relativeUrl) { Content = content };
            var token = await _credential.GetTokenAsync(new TokenRequestContext(GraphScopes), ct);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);

            using var response = await _http.SendAsync(request, ct);
            var payload = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Graph {Method} {Url} returned {Status}", method, relativeUrl, (int)response.StatusCode);
                return Error.Failure("Graph.RequestFailed", $"Graph returned {(int)response.StatusCode}.");
            }

            return payload;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Graph {Method} {Url} threw", method, relativeUrl);
            return Error.Failure("Graph.RequestException", "Graph request failed.");
        }
    }

    private static GraphSubscription MapSubscription(JsonElement element) => new(
        element.GetProperty("id").GetString() ?? string.Empty,
        element.TryGetProperty("expirationDateTime", out var exp) ? exp.GetDateTime() : DateTime.UtcNow);
}
