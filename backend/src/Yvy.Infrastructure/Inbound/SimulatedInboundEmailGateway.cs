using ErrorOr;
using Microsoft.Extensions.Logging;
using Yvy.Application.Abstractions;
using Yvy.Application.KanbanCards.DTOs;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Default <see cref="IInboundEmailGateway"/> for dev and tests — serves synthesized messages with no
/// live Graph tenant (email-ingestion-spec §2). <see cref="GetMessageAsync"/> fabricates a stable,
/// PII-safe message for whatever id the queue holds, so the whole ingestion pipeline (webhook →
/// notification → job → card) runs end-to-end with zero Entra dependency. Subscription methods are
/// no-ops returning a fake subscription.
/// </summary>
public sealed class SimulatedInboundEmailGateway : IInboundEmailGateway
{
    private readonly ILogger<SimulatedInboundEmailGateway> _logger;

    public SimulatedInboundEmailGateway(ILogger<SimulatedInboundEmailGateway> logger) => _logger = logger;

    public Task<ErrorOr<InboundEmailMessage>> GetMessageAsync(string messageId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(messageId))
            return Task.FromResult<ErrorOr<InboundEmailMessage>>(Error.Validation(
                "InboundEmail.MissingMessageId", "A message id is required."));

        // Deterministic, fixture-style message derived from the id. No real PII — safe for logs/preview.
        var message = new InboundEmailMessage(
            MessageId: messageId,
            From: "fornecedor@exemplo.com",
            Subject: $"[Simulado] Documento {messageId}",
            ReceivedAt: DateTime.UtcNow,
            BodyPreview: "Mensagem simulada para desenvolvimento — sem conteúdo real.",
            RawBodyRef: null);

        _logger.LogInformation("Simulated gateway served message {MessageId}", messageId);
        return Task.FromResult<ErrorOr<InboundEmailMessage>>(message);
    }

    public Task<ErrorOr<IReadOnlyList<GraphSubscription>>> ListSubscriptionsAsync(CancellationToken ct = default) =>
        Task.FromResult<ErrorOr<IReadOnlyList<GraphSubscription>>>(Array.Empty<GraphSubscription>());

    public Task<ErrorOr<GraphSubscription>> CreateSubscriptionAsync(CancellationToken ct = default) =>
        Task.FromResult<ErrorOr<GraphSubscription>>(FakeSubscription());

    public Task<ErrorOr<GraphSubscription>> RenewSubscriptionAsync(string subscriptionId, CancellationToken ct = default) =>
        Task.FromResult<ErrorOr<GraphSubscription>>(
            new GraphSubscription(subscriptionId, DateTime.UtcNow.AddDays(2)));

    public Task DeleteSubscriptionAsync(string subscriptionId, CancellationToken ct = default) =>
        Task.CompletedTask;

    private static GraphSubscription FakeSubscription() =>
        new($"simulated-{Guid.NewGuid():N}", DateTime.UtcNow.AddDays(2));
}
