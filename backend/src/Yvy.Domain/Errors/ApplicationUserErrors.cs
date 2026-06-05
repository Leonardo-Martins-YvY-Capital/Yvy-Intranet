using ErrorOr;

namespace Yvy.Domain.Errors;

public static class ApplicationUserErrors
{
    public static readonly Error NotProvisioned =
        Error.NotFound(
            "ApplicationUser.NotProvisioned",
            "The application user has not been provisioned.");

    public static readonly Error Disabled =
        Error.Forbidden("ApplicationUser.Disabled", "The application user is disabled.");

    public static readonly Error InvalidUpn =
        Error.Validation("ApplicationUser.InvalidUpn", "User principal name cannot be empty.");

    public static readonly Error InvalidDisplayName =
        Error.Validation("ApplicationUser.InvalidDisplayName", "Display name cannot be empty.");
}
