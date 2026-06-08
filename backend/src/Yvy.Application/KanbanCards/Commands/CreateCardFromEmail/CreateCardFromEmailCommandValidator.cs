using FluentValidation;

namespace Yvy.Application.KanbanCards.Commands.CreateCardFromEmail;

public sealed class CreateCardFromEmailCommandValidator : AbstractValidator<CreateCardFromEmailCommand>
{
    public CreateCardFromEmailCommandValidator()
    {
        RuleFor(x => x.Message).NotNull();
        RuleFor(x => x.Message.MessageId).NotEmpty();
    }
}
