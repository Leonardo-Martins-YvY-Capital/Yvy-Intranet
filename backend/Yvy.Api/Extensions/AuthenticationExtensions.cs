using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Yvy.Api.Authentication;
using Yvy.Application.Abstractions;

namespace Yvy.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddEntraAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApi(configuration.GetSection("EntraId"));

        // App Roles arrive in the "roles" claim. Point RequireRole at it, and chain JIT provisioning
        // onto Microsoft.Identity.Web's own OnTokenValidated (PostConfigure runs after its setup).
        services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.TokenValidationParameters.RoleClaimType = EntraClaims.Roles;

            var prior = options.Events?.OnTokenValidated;
            options.Events ??= new JwtBearerEvents();
            options.Events.OnTokenValidated = async context =>
            {
                if (prior is not null) await prior(context);
                if (context.Principal is not null)
                    await UserProvisioning.EnsureProvisionedAsync(
                        context.Principal,
                        context.HttpContext.RequestServices,
                        context.HttpContext.RequestAborted);
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(AuthorizationPolicies.Approver, p => p.RequireRole(AuthorizationPolicies.Approver));
            options.AddPolicy(AuthorizationPolicies.Operator, p => p.RequireRole(AuthorizationPolicies.Operator));
            options.AddPolicy(AuthorizationPolicies.Viewer, p => p.RequireRole(AuthorizationPolicies.Viewer));
            options.AddPolicy(AuthorizationPolicies.Admin, p => p.RequireRole(AuthorizationPolicies.Admin));
            options.AddPolicy(AuthorizationPolicies.FundWrite,
                p => p.RequireRole(AuthorizationPolicies.Operator, AuthorizationPolicies.Admin));
        });

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

        return services;
    }
}
