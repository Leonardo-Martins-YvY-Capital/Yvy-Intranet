using Yvy.Domain.Primitives;

namespace Yvy.Domain.Aggregates.Users.Events;

/// <summary>
/// Raised when a staff identity is JIT-provisioned on first authenticated request.
/// Carries primitives only (not value objects) so it round-trips safely through the Outbox,
/// mirroring <c>InvestorOnboardedDomainEvent</c>.
/// </summary>
public sealed record ApplicationUserProvisionedDomainEvent(
    Guid EventId,
    DateTime OccurredOn,
    Guid UserId,
    string EntraObjectId) : IDomainEvent;
