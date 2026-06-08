using Yvy.Domain.Primitives;

namespace Yvy.Domain.Aggregates.Kanban.Events;

/// <summary>
/// Raised when a card is created from an inbound email. Primitives only (Outbox JSON-serialization
/// safety), mirroring the other domain events.
/// </summary>
public sealed record CardCreatedFromEmailDomainEvent(
    Guid EventId,
    DateTime OccurredOn,
    Guid CardId,
    ProcessType ProcessType,
    string MessageId) : IDomainEvent;
