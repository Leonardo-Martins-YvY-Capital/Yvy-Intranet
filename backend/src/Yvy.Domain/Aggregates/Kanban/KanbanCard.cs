using ErrorOr;
using Yvy.Domain.Aggregates.Kanban.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.Primitives;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Aggregates.Kanban;

/// <summary>
/// One financial request (a bill to pay, or an internal reimbursement) that arrives by email and moves
/// through a fixed, action-driven phase sequence. Mirrors the <c>Fund</c>/<c>Investor</c> aggregate
/// pattern (private setters, static factory, behaviour returning <see cref="ErrorOr"/>, domain events).
///
/// Slice 1 (ingestion): creation only — guarded phase transitions land in the approval slice
/// (kanban-card-spec §4/§5).
/// </summary>
public sealed class KanbanCard : AggregateRoot
{
    private KanbanCard(Guid id) : base(id) { }

    private KanbanCard() { } // EF Core

    public ProcessType ProcessType { get; private set; }
    public CardPhase Phase { get; private set; }
    public string Title { get; private set; } = null!;
    public InboundEmailRef Email { get; private set; } = null!;
    public string? Payee { get; private set; }
    public Money? Amount { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>Factory: a new card always starts in <see cref="CardPhase.Recebido"/>.</summary>
    public static ErrorOr<KanbanCard> CreateFromEmail(ProcessType process, InboundEmailRef email, string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return KanbanCardErrors.InvalidTitle;

        var card = new KanbanCard(Guid.NewGuid())
        {
            ProcessType = process,
            Email = email,
            Title = title,
            Phase = CardPhase.Recebido,
            CreatedAt = DateTime.UtcNow,
        };

        card.RaiseDomainEvent(new CardCreatedFromEmailDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            card.Id,
            process,
            email.MessageId));

        return card;
    }
}
