using Yvy.Domain.Primitives;

namespace Yvy.Domain.Aggregates.Investors.Events;

public sealed record InvestorOnboardedDomainEvent(
    Guid EventId,
    DateTime OccurredOn,
    Guid InvestorId,
    string InvestorName,
    InvestorType InvestorType) : IDomainEvent;
