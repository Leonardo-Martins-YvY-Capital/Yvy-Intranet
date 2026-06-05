using ErrorOr;
using Yvy.Application.Abstractions;
using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Application.Users.Commands.EnsureUserProvisioned;

public sealed class EnsureUserProvisionedCommandHandler
    : ICommandHandler<EnsureUserProvisionedCommand, Guid>
{
    private readonly IApplicationUserRepository _users;

    public EnsureUserProvisionedCommandHandler(IApplicationUserRepository users) => _users = users;

    public async Task<ErrorOr<Guid>> Handle(
        EnsureUserProvisionedCommand request,
        CancellationToken cancellationToken)
    {
        var oidResult = EntraObjectId.Create(request.EntraObjectId);
        if (oidResult.IsError) return oidResult.Errors;

        // Idempotent: existing user → record login + reconcile roles (Entra is source of truth).
        var existing = await _users.GetByEntraObjectIdAsync(oidResult.Value, cancellationToken);
        if (existing is not null)
        {
            existing.RecordLogin(DateTime.UtcNow);
            existing.SyncRoles(request.Roles);
            return existing.Id;
        }

        var emailResult = Email.Create(request.Email);
        if (emailResult.IsError) return emailResult.Errors;

        var userResult = ApplicationUser.Provision(
            oidResult.Value,
            request.Upn,
            emailResult.Value,
            request.DisplayName,
            request.Roles);
        if (userResult.IsError) return userResult.Errors;

        var user = userResult.Value;
        user.RecordLogin(DateTime.UtcNow);

        await _users.AddAsync(user, cancellationToken);
        // TransactionBehavior commits (request is a command).
        return user.Id;
    }
}
