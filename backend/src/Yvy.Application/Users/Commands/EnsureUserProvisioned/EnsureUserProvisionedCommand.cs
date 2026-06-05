using Yvy.Application.Abstractions;
using Yvy.Domain.Aggregates.Users;

namespace Yvy.Application.Users.Commands.EnsureUserProvisioned;

/// <summary>
/// Idempotently ensures a local <c>ApplicationUser</c> exists for the authenticated Entra identity,
/// recording the login and syncing roles from the token. Returns the local user id. Issued by the
/// API's JIT-provisioning hook on each authenticated request.
/// </summary>
public sealed record EnsureUserProvisionedCommand(
    string EntraObjectId,
    string Upn,
    string Email,
    string DisplayName,
    IReadOnlyCollection<Role> Roles) : ICommand<Guid>;
