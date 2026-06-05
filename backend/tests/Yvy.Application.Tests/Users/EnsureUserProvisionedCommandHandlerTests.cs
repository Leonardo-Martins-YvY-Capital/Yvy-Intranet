using FluentAssertions;
using NSubstitute;
using Yvy.Application.Users.Commands.EnsureUserProvisioned;
using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Application.Tests.Users;

public sealed class EnsureUserProvisionedCommandHandlerTests
{
    private const string Oid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

    private readonly IApplicationUserRepository _users = Substitute.For<IApplicationUserRepository>();
    private readonly EnsureUserProvisionedCommandHandler _handler;

    public EnsureUserProvisionedCommandHandlerTests()
    {
        _handler = new EnsureUserProvisionedCommandHandler(_users);
    }

    private static EnsureUserProvisionedCommand Command(params Role[] roles) =>
        new(Oid, "leonardo@yvy.capital", "leonardo@yvy.capital", "Leonardo Martins",
            roles.Length == 0 ? [Role.Viewer] : roles);

    [Fact]
    public async Task Handle_WhenUserDoesNotExist_ProvisionsAndReturnsNewId()
    {
        _users.GetByEntraObjectIdAsync(Arg.Any<EntraObjectId>(), Arg.Any<CancellationToken>())
            .Returns((ApplicationUser?)null);

        var result = await _handler.Handle(Command(Role.Approver), CancellationToken.None);

        result.IsError.Should().BeFalse();
        result.Value.Should().NotBeEmpty();
        await _users.Received(1).AddAsync(Arg.Any<ApplicationUser>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenUserExists_IsIdempotent_SyncsRolesAndDoesNotAdd()
    {
        var existing = ApplicationUser.Provision(
            EntraObjectId.Create(Oid).Value,
            "leonardo@yvy.capital",
            Email.Create("leonardo@yvy.capital").Value,
            "Leonardo Martins",
            [Role.Viewer]).Value;

        _users.GetByEntraObjectIdAsync(Arg.Any<EntraObjectId>(), Arg.Any<CancellationToken>())
            .Returns(existing);

        var result = await _handler.Handle(Command(Role.Approver, Role.Admin), CancellationToken.None);

        result.IsError.Should().BeFalse();
        result.Value.Should().Be(existing.Id);
        existing.Roles.Should().BeEquivalentTo([Role.Approver, Role.Admin]);
        existing.LastLoginAt.Should().NotBeNull();
        await _users.DidNotReceive().AddAsync(Arg.Any<ApplicationUser>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithInvalidOid_ReturnsError()
    {
        var command = new EnsureUserProvisionedCommand(
            "not-a-guid", "leonardo@yvy.capital", "leonardo@yvy.capital", "Leonardo Martins", [Role.Viewer]);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        await _users.DidNotReceive().AddAsync(Arg.Any<ApplicationUser>(), Arg.Any<CancellationToken>());
    }
}
