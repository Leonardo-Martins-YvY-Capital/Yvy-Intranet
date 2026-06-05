using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.ValueObjects;

namespace Yvy.Application.Abstractions;

/// <summary>
/// The authenticated caller's identity, surfaced to handlers without leaking <c>HttpContext</c> into
/// the application layer. The Kanban <c>ApproveCard</c>/<c>RejectCard</c> handlers depend on this.
/// Implemented in the API layer over the validated token's claims.
/// </summary>
public interface ICurrentUserProvider
{
    /// <summary>Local <c>ApplicationUser.Id</c> (added as a claim after JIT provisioning); null if anonymous.</summary>
    Guid? UserId { get; }

    EntraObjectId? EntraObjectId { get; }

    string? Email { get; }

    IReadOnlySet<Role> Roles { get; }

    bool IsInRole(Role role);
}
