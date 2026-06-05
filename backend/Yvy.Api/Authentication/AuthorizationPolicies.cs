namespace Yvy.Api.Authentication;

/// <summary>
/// Authorization policy names. The four role policies map 1:1 to the Entra App Roles; <see cref="FundWrite"/>
/// is a composite (Operator or Admin) guarding fund writes.
/// </summary>
public static class AuthorizationPolicies
{
    public const string Approver = "Approver";
    public const string Operator = "Operator";
    public const string Viewer = "Viewer";
    public const string Admin = "Admin";

    public const string FundWrite = "FundWrite";
}
