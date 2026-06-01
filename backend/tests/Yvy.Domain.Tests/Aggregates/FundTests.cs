using FluentAssertions;
using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.Aggregates.Funds.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.Aggregates;

public sealed class FundTests
{
    private static Fund CreateValidFund() =>
        Fund.Create(
            FundCode.Create("YVYQ11").Value,
            "Yvy Fundo de Infraestrutura",
            FundType.FII,
            Money.Create(5000m).Value).Value;

    [Fact]
    public void Create_WithValidData_ReturnsFundInDraftStatus()
    {
        var result = Fund.Create(
            FundCode.Create("YVYQ11").Value,
            "Yvy FII",
            FundType.FII,
            Money.Create(1000m).Value);

        result.IsError.Should().BeFalse();
        result.Value.Status.Should().Be(FundStatus.Draft);
        result.Value.Code.Value.Should().Be("YVYQ11");
    }

    [Fact]
    public void Create_WithEmptyName_ReturnsError()
    {
        var result = Fund.Create(
            FundCode.Create("YVYQ11").Value,
            "",
            FundType.FII,
            Money.Create(1000m).Value);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.InvalidName);
    }

    [Fact]
    public void Create_RaisesFundCreatedDomainEvent()
    {
        var fund = CreateValidFund();

        fund.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<FundCreatedDomainEvent>();
    }

    [Fact]
    public void Activate_FromDraft_SetsStatusToActive()
    {
        var fund = CreateValidFund();
        fund.ClearDomainEvents();

        var result = fund.Activate();

        result.IsError.Should().BeFalse();
        fund.Status.Should().Be(FundStatus.Active);
    }

    [Fact]
    public void Activate_FromDraft_RaisesFundStatusChangedEvent()
    {
        var fund = CreateValidFund();
        fund.ClearDomainEvents();

        fund.Activate();

        fund.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<FundStatusChangedDomainEvent>()
            .Which.NewStatus.Should().Be(FundStatus.Active);
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ReturnsError()
    {
        var fund = CreateValidFund();
        fund.Activate();

        var result = fund.Activate();

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.NotInDraftStatus);
    }

    [Fact]
    public void Suspend_WhenActive_SetsStatusToSuspended()
    {
        var fund = CreateValidFund();
        fund.Activate();

        var result = fund.Suspend();

        result.IsError.Should().BeFalse();
        fund.Status.Should().Be(FundStatus.Suspended);
    }

    [Fact]
    public void Suspend_WhenNotActive_ReturnsError()
    {
        var fund = CreateValidFund();

        var result = fund.Suspend();

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.NotActive);
    }

    [Fact]
    public void Liquidate_WhenAlreadyLiquidated_ReturnsError()
    {
        var fund = CreateValidFund();
        fund.Liquidate();

        var result = fund.Liquidate();

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.AlreadyLiquidated);
    }
}
