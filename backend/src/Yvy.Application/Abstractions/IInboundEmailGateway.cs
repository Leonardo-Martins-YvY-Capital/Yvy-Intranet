using ErrorOr;
using Yvy.Application.KanbanCards.DTOs;

namespace Yvy.Application.Abstractions;

/// <summary>
/// The seam between the Kanban ingestion pipeline and Microsoft Graph. A simulated implementation
/// serves fixtures for dev/tests (no live tenant); a real implementation talks to Graph app-only.
/// Plain DTOs keep the Graph SDK out of the application layer (email-ingestion-spec §2).
/// </summary>
public interface IInboundEmailGateway
{
    // Message access
    Task<ErrorOr<InboundEmailMessage>> GetMessageAsync(string messageId, CancellationToken ct = default);

    // Subscription lifecycle (driven by ManageGraphSubscriptionJob)
    Task<ErrorOr<GraphSubscription>> CreateSubscriptionAsync(CancellationToken ct = default);
    Task<ErrorOr<GraphSubscription>> RenewSubscriptionAsync(string subscriptionId, CancellationToken ct = default);
    Task DeleteSubscriptionAsync(string subscriptionId, CancellationToken ct = default);
}
