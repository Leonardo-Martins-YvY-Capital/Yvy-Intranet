using ErrorOr;
using Yvy.Domain.Aggregates.Funds.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.Primitives;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Aggregates.Funds;

public sealed class Fund : AggregateRoot
{
    private Fund(Guid id) : base(id) { }

    private Fund() { } // EF Core

    public FundCode Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public FundType Type { get; private set; }
    public FundStatus Status { get; private set; }
    public Money MinimumInvestment { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public static ErrorOr<Fund> Create(
        FundCode code,
        string name,
        FundType type,
        Money minimumInvestment)
    {
        if (string.IsNullOrWhiteSpace(name))
            return FundErrors.InvalidName;

        var fund = new Fund(Guid.NewGuid())
        {
            Code = code,
            Name = name,
            Type = type,
            MinimumInvestment = minimumInvestment,
            Status = FundStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        fund.RaiseDomainEvent(new FundCreatedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            fund.Id,
            fund.Code,
            fund.Name));

        return fund;
    }

    public ErrorOr<Updated> Activate()
    {
        if (Status == FundStatus.Liquidated)
            return FundErrors.AlreadyLiquidated;

        if (Status != FundStatus.Draft)
            return FundErrors.NotInDraftStatus;

        var oldStatus = Status;
        Status = FundStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new FundStatusChangedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            Id,
            oldStatus,
            FundStatus.Active));

        return Result.Updated;
    }

    public ErrorOr<Updated> Suspend()
    {
        if (Status != FundStatus.Active)
            return FundErrors.NotActive;

        var oldStatus = Status;
        Status = FundStatus.Suspended;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new FundStatusChangedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            Id,
            oldStatus,
            FundStatus.Suspended));

        return Result.Updated;
    }

    public ErrorOr<Updated> Liquidate()
    {
        if (Status == FundStatus.Liquidated)
            return FundErrors.AlreadyLiquidated;

        var oldStatus = Status;
        Status = FundStatus.Liquidated;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new FundStatusChangedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            Id,
            oldStatus,
            FundStatus.Liquidated));

        return Result.Updated;
    }
}
