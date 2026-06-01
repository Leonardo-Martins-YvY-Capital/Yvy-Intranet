using ErrorOr;

namespace Yvy.Domain.Errors;

public static class InvestorErrors
{
    public static readonly Error NotFound =
        Error.NotFound("Investor.NotFound", "Investor was not found.");

    public static readonly Error InvalidName =
        Error.Validation("Investor.InvalidName", "Investor name cannot be empty.");

    public static readonly Error AlreadyActive =
        Error.Conflict("Investor.AlreadyActive", "Investor is already active.");

    public static readonly Error NotActive =
        Error.Conflict("Investor.NotActive", "Investor is not active.");
}
