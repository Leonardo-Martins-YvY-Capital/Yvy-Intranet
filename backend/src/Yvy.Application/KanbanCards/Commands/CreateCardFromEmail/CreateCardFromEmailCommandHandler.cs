using ErrorOr;
using Yvy.Application.Abstractions;
using Yvy.Domain.Aggregates.Kanban;
using Yvy.Domain.Errors;
using Yvy.Domain.Repositories;

namespace Yvy.Application.KanbanCards.Commands.CreateCardFromEmail;

public sealed class CreateCardFromEmailCommandHandler
    : ICommandHandler<CreateCardFromEmailCommand, Guid>
{
    private readonly IKanbanCardRepository _cards;

    public CreateCardFromEmailCommandHandler(IKanbanCardRepository cards) => _cards = cards;

    public async Task<ErrorOr<Guid>> Handle(CreateCardFromEmailCommand request, CancellationToken cancellationToken)
    {
        var msg = request.Message;

        // Idempotency: replayed/duplicate Graph notifications must never create a second card.
        if (await _cards.ExistsByMessageIdAsync(msg.MessageId, cancellationToken))
            return KanbanCardErrors.DuplicateEmail;

        var emailRef = InboundEmailRef.Create(
            msg.MessageId, msg.From, msg.Subject, msg.ReceivedAt, msg.BodyPreview, msg.RawBodyRef);
        if (emailRef.IsError) return emailRef.Errors;

        // Title defaults from the subject (kanban-card-spec §5).
        var title = string.IsNullOrWhiteSpace(msg.Subject) ? "(sem assunto)" : msg.Subject.Trim();

        var card = KanbanCard.CreateFromEmail(request.Process, emailRef.Value, title);
        if (card.IsError) return card.Errors;

        await _cards.AddAsync(card.Value, cancellationToken);
        // TransactionBehavior commits (request is a command).
        return card.Value.Id;
    }
}
