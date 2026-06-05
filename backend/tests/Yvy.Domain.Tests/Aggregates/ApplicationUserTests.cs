using FluentAssertions;
using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.Aggregates.Users.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.Aggregates;

public sealed class ApplicationUserTests
{
    private const string Oid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

    private static EntraObjectId EntraId() => EntraObjectId.Create(Oid).Value;
    private static Email Mail() => Email.Create("leonardo@yvy.capital").Value;

    private static ApplicationUser ProvisionValid(params Role[] roles) =>
        ApplicationUser.Provision(
            EntraId(),
            "leonardo@yvy.capital",
            Mail(),
            "Leonardo Martins",
            roles.Length == 0 ? [Role.Viewer] : roles).Value;

    [Fact]
    public void Provision_WithValidData_ReturnsActiveUserWithRoles()
    {
        var result = ApplicationUser.Provision(
            EntraId(), "leonardo@yvy.capital", Mail(), "Leonardo Martins", [Role.Approver]);

        result.IsError.Should().BeFalse();
        result.Value.Status.Should().Be(UserStatus.Active);
        result.Value.Roles.Should().BeEquivalentTo([Role.Approver]);
        result.Value.CreatedAt.Should().NotBe(default);
        result.Value.LastLoginAt.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Provision_WithEmptyUpn_ReturnsError(string upn)
    {
        var result = ApplicationUser.Provision(
            EntraId(), upn, Mail(), "Leonardo Martins", [Role.Viewer]);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(ApplicationUserErrors.InvalidUpn);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Provision_WithEmptyDisplayName_ReturnsError(string displayName)
    {
        var result = ApplicationUser.Provision(
            EntraId(), "leonardo@yvy.capital", Mail(), displayName, [Role.Viewer]);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(ApplicationUserErrors.InvalidDisplayName);
    }

    [Fact]
    public void Provision_RaisesExactlyOneProvisionedEvent()
    {
        var user = ProvisionValid(Role.Operator);

        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ApplicationUserProvisionedDomainEvent>()
            .Which.UserId.Should().Be(user.Id);
    }

    [Fact]
    public void RecordLogin_SetsLastLoginAt()
    {
        var user = ProvisionValid();
        var now = DateTime.UtcNow;

        var result = user.RecordLogin(now);

        result.IsError.Should().BeFalse();
        user.LastLoginAt.Should().Be(now);
    }

    [Fact]
    public void SyncRoles_ReplacesExistingRoles()
    {
        var user = ProvisionValid(Role.Viewer);

        var result = user.SyncRoles([Role.Approver, Role.Admin]);

        result.IsError.Should().BeFalse();
        user.Roles.Should().BeEquivalentTo([Role.Approver, Role.Admin]);
    }
}
