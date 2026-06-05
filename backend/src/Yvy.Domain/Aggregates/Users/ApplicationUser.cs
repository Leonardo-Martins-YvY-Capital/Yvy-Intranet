using ErrorOr;
using Yvy.Domain.Aggregates.Users.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.Primitives;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Aggregates.Users;

/// <summary>
/// A staff identity, JIT-provisioned from an Entra ID access token on first authenticated request.
/// Entra is the source of truth for role membership; <see cref="SyncRoles"/> reconciles the local
/// copy on each login. Mirrors the <c>Investor</c> aggregate (private setters, static factory,
/// behavior methods returning <see cref="ErrorOr"/>, domain events).
/// </summary>
public sealed class ApplicationUser : AggregateRoot
{
    // Not readonly: EF rehydrates this via a value converter that replaces the whole set on load.
    // Domain code only ever mutates it in place (Add/Clear), never reassigns.
    private HashSet<Role> _roles = [];

    private ApplicationUser(Guid id) : base(id) { }

    private ApplicationUser() { } // EF Core

    public EntraObjectId EntraObjectId { get; private set; } = null!;
    public string Upn { get; private set; } = null!;
    public Email Email { get; private set; } = null!;
    public string DisplayName { get; private set; } = null!;
    public IReadOnlySet<Role> Roles => _roles;
    public UserStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    public static ErrorOr<ApplicationUser> Provision(
        EntraObjectId entraObjectId,
        string upn,
        Email email,
        string displayName,
        IEnumerable<Role> roles)
    {
        if (string.IsNullOrWhiteSpace(upn))
            return ApplicationUserErrors.InvalidUpn;

        if (string.IsNullOrWhiteSpace(displayName))
            return ApplicationUserErrors.InvalidDisplayName;

        var user = new ApplicationUser(Guid.NewGuid())
        {
            EntraObjectId = entraObjectId,
            Upn = upn,
            Email = email,
            DisplayName = displayName,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var role in roles)
            user._roles.Add(role);

        user.RaiseDomainEvent(new ApplicationUserProvisionedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            user.Id,
            user.EntraObjectId.Value));

        return user;
    }

    public ErrorOr<Updated> RecordLogin(DateTime utcNow)
    {
        LastLoginAt = utcNow;
        return Result.Updated;
    }

    /// <summary>Reconciles local roles with the token's role claims (Entra is the source of truth).</summary>
    public ErrorOr<Updated> SyncRoles(IEnumerable<Role> roles)
    {
        _roles.Clear();
        foreach (var role in roles)
            _roles.Add(role);

        return Result.Updated;
    }
}
