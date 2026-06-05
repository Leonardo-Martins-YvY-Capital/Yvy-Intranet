using Yvy.Application.KanbanCards.DTOs;
using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// V1 routing: every inbound email becomes a <see cref="ProcessType.ContasAPagar"/> card. Swap this
/// registration for a subject/address-aware router once the finance team defines the rule.
/// </summary>
public sealed class DefaultProcessTypeRouter : IProcessTypeRouter
{
    public ProcessType Resolve(InboundEmailMessage message) => ProcessType.ContasAPagar;
}
