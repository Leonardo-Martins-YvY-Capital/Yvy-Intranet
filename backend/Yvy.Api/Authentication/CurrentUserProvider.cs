using System.Security.Claims;
using Yvy.Application.Abstractions;
using Yvy.Domain.Aggregates.Users;

namespace Yvy.Api.Authentication;

/// <summary>
/// Reads the authenticated caller's identity from the validated token's claims on the current request.
/// The only place that touches <c>HttpContext</c> for identity — the application layer depends solely
/// on <see cref="ICurrentUserProvider"/>.
/// </summary>
public sealed class CurrentUserProvider : ICurrentUserProvider
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserProvider(IHttpContextAccessor accessor) => _accessor = accessor;

    private ClaimsPrincipal? User => _accessor.HttpContext?.User;

    public Guid? UserId =>
        Guid.TryParse(User?.FindFirstValue(EntraClaims.LocalUserId), out var id) ? id : null;

    public Domain.ValueObjects.EntraObjectId? EntraObjectId
    {
        get
        {
            var oid = User?.Oid_();
            if (string.IsNullOrWhiteSpace(oid)) return null;

            var result = Domain.ValueObjects.EntraObjectId.Create(oid);
            return result.IsError ? null : result.Value;
        }
    }

    public string? Email => User?.Email_();

    public IReadOnlySet<Role> Roles => User?.Roles_() ?? new HashSet<Role>();

    public bool IsInRole(Role role) => Roles.Contains(role);
}
