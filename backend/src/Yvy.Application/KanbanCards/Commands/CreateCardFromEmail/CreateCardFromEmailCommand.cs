using Yvy.Application.Abstractions;
using Yvy.Application.KanbanCards.DTOs;
using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Application.KanbanCards.Commands.CreateCardFromEmail;

/// <summary>
/// Creates a <c>KanbanCard</c> from a fetched inbound email. Invoked by the ingestion job; **idempotent**
/// (a replayed/duplicate Graph notification must never create two cards). Returns the new card id.
/// </summary>
public sealed record CreateCardFromEmailCommand(
    ProcessType Process,
    InboundEmailMessage Message) : ICommand<Guid>;
