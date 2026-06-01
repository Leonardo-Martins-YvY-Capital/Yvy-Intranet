using Yvy.Domain.Primitives;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Aggregates.Funds.Events;

public sealed record FundCreatedDomainEvent(
    Guid EventId,
    DateTime OccurredOn,
    Guid FundId,
    FundCode FundCode,
    string FundName) : IDomainEvent;
