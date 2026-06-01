using ErrorOr;

namespace Yvy.Domain.Errors;

public static class FundErrors
{
    public static readonly Error NotFound =
        Error.NotFound("Fund.NotFound", "Fund was not found.");

    public static readonly Error CodeAlreadyExists =
        Error.Conflict("Fund.CodeAlreadyExists", "A fund with this code already exists.");

    public static readonly Error InvalidName =
        Error.Validation("Fund.InvalidName", "Fund name cannot be empty.");

    public static readonly Error InvalidFundType =
        Error.Validation("Fund.InvalidFundType", "The provided fund type is not valid.");

    public static readonly Error NotInDraftStatus =
        Error.Conflict("Fund.NotInDraftStatus", "Only funds in Draft status can be activated.");

    public static readonly Error NotActive =
        Error.Conflict("Fund.NotActive", "Fund is not active.");

    public static readonly Error AlreadyLiquidated =
        Error.Conflict("Fund.AlreadyLiquidated", "Fund has already been liquidated.");
}
