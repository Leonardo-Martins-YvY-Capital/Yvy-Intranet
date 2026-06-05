using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Yvy.Api.Authentication;

namespace Yvy.Api.IntegrationTests.Infrastructure;

/// <summary>
/// Stands in for Entra JWT validation in integration tests. Reads identity + roles from
/// <c>X-Test-*</c> request headers and builds the same claim shape the real token produces, then runs
/// the production JIT-provisioning path (<see cref="UserProvisioning"/>) so authn, role authz, and
/// provisioning are all exercised without a live tenant. No header → anonymous (401 on protected routes).
/// </summary>
public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var oid = Request.Headers["X-Test-Oid"].ToString();
        if (string.IsNullOrWhiteSpace(oid))
            return AuthenticateResult.NoResult(); // anonymous → 401 on protected routes

        var email = Request.Headers["X-Test-Email"].ToString();
        var upn = Request.Headers["X-Test-Upn"].ToString();
        var name = Request.Headers["X-Test-Name"].ToString();
        var roles = Request.Headers["X-Test-Roles"].ToString()
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var claims = new List<Claim>
        {
            new(EntraClaims.Oid, oid),
            new(EntraClaims.PreferredUsername, string.IsNullOrWhiteSpace(upn) ? email : upn),
            new(EntraClaims.Email, email),
            new(EntraClaims.Name, string.IsNullOrWhiteSpace(name) ? "Test User" : name),
        };
        claims.AddRange(roles.Select(r => new Claim(EntraClaims.Roles, r)));

        // roleType = "roles" so RequireRole(...) reads the App Roles claim.
        var identity = new ClaimsIdentity(claims, SchemeName, EntraClaims.PreferredUsername, EntraClaims.Roles);
        var principal = new ClaimsPrincipal(identity);

        await UserProvisioning.EnsureProvisionedAsync(principal, Context.RequestServices, Context.RequestAborted);

        return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
    }
}
