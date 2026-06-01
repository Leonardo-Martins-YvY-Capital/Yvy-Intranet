using Yvy.Domain.Primitives;

namespace Yvy.Domain.Aggregates.Funds.Events;

public sealed record FundStatusChangedDomainEvent(
    Guid EventId,
    DateTime OccurredOn,
    Guid FundId,
    FundStatus OldStatus,
    FundStatus NewStatus) : IDomainEvent;
