using Yvy.Application.KanbanCards.DTOs;
using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Decides which <see cref="ProcessType"/> an inbound email belongs to. V1 uses a single mailbox so
/// the default routes everything to <see cref="ProcessType.ContasAPagar"/>; a subject/address rule
/// can replace the implementation later with no changes to <c>ProcessInboundEmailsJob</c>
/// (email-ingestion-spec §4/§10 — the routing business rule is still open).
/// </summary>
public interface IProcessTypeRouter
{
    ProcessType Resolve(InboundEmailMessage message);
}
