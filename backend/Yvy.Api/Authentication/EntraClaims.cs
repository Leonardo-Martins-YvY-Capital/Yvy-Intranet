using System.Security.Claims;
using Yvy.Domain.Aggregates.Users;

namespace Yvy.Api.Authentication;

/// <summary>Claim names used on the Entra access token, plus helpers to read them off a principal.</summary>
public static class EntraClaims
{
    public const string Oid = "oid";
    public const string ObjectIdSchema = "http://schemas.microsoft.com/identity/claims/objectidentifier";
    public const string PreferredUsername = "preferred_username";
    public const string Upn = "upn";
    public const string Email = "email";
    public const string Name = "name";
    public const string Roles = "roles";

    /// <summary>Local <c>ApplicationUser.Id</c>, added to the principal after JIT provisioning.</summary>
    public const string LocalUserId = "yvy_uid";

    public static string? Oid_(this ClaimsPrincipal p) =>
        p.FindFirstValue(Oid) ?? p.FindFirstValue(ObjectIdSchema);

    public static string? Upn_(this ClaimsPrincipal p) =>
        p.FindFirstValue(PreferredUsername) ?? p.FindFirstValue(Upn);

    public static string? Email_(this ClaimsPrincipal p) =>
        p.FindFirstValue(Email) ?? p.FindFirstValue(PreferredUsername) ?? p.FindFirstValue(Upn);

    public static string? DisplayName_(this ClaimsPrincipal p) =>
        p.FindFirstValue(Name) ?? p.Upn_();

    public static IReadOnlySet<Role> Roles_(this ClaimsPrincipal p) =>
        p.FindAll(Roles)
            .Select(c => Enum.TryParse<Role>(c.Value, out var r) ? (Role?)r : null)
            .Where(r => r.HasValue)
            .Select(r => r!.Value)
            .ToHashSet();
}
