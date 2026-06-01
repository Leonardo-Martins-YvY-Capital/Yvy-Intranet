using FluentValidation;

namespace Yvy.Application.Funds.Commands.CreateFund;

public sealed class CreateFundCommandValidator : AbstractValidator<CreateFundCommand>
{
    public CreateFundCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .Matches(@"^[A-Za-z]{4,6}\d{2}$")
            .WithMessage("Fund code must be 4-6 letters followed by 2 digits (e.g. YVYQ11).");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.MinimumInvestmentAmount)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.MinimumInvestmentCurrency)
            .NotEmpty()
            .Length(3);
    }
}
