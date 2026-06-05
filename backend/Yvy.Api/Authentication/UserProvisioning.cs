using System.Security.Claims;
using MediatR;
using Yvy.Application.Users.Commands.EnsureUserProvisioned;

namespace Yvy.Api.Authentication;

/// <summary>
/// Just-in-time provisioning, scheme-agnostic: given an authenticated principal, ensure a local
/// <c>application_users</c> row exists (idempotent), then stamp the local user id onto the principal
/// so <see cref="CurrentUserProvider"/> can expose it synchronously. Invoked by the real JWT
/// <c>OnTokenValidated</c> event and by the integration test-auth handler alike. Never logs claim
/// values (CVM 175 / PII).
/// </summary>
public static class UserProvisioning
{
    public static async Task EnsureProvisionedAsync(
        ClaimsPrincipal principal,
        IServiceProvider services,
        CancellationToken ct)
    {
        if (principal.Identity is not ClaimsIdentity identity) return;

        var oid = principal.Oid_();
        if (string.IsNullOrWhiteSpace(oid)) return; // no stable key → cannot provision

        var command = new EnsureUserProvisionedCommand(
            oid,
            principal.Upn_() ?? oid,
            principal.Email_() ?? string.Empty,
            principal.DisplayName_() ?? principal.Upn_() ?? oid,
            principal.Roles_().ToArray());

        var sender = services.GetRequiredService<ISender>();
        var result = await sender.Send(command, ct);

        if (!result.IsError)
            identity.AddClaim(new Claim(EntraClaims.LocalUserId, result.Value.ToString()));
    }
}
