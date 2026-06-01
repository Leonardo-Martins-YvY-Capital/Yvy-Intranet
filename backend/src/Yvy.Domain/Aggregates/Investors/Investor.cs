using ErrorOr;
using Yvy.Domain.Aggregates.Investors.Events;
using Yvy.Domain.Errors;
using Yvy.Domain.Primitives;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Aggregates.Investors;

public sealed class Investor : AggregateRoot
{
    private Investor(Guid id) : base(id) { }

    private Investor() { } // EF Core

    public string Name { get; private set; } = null!;
    public Email Email { get; private set; } = null!;
    public Cpf? Cpf { get; private set; }
    public Cnpj? Cnpj { get; private set; }
    public InvestorType Type { get; private set; }
    public InvestorStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public static ErrorOr<Investor> CreateNaturalPerson(
        Cpf cpf,
        string fullName,
        Email email)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return InvestorErrors.InvalidName;

        var investor = new Investor(Guid.NewGuid())
        {
            Cpf = cpf,
            Name = fullName,
            Email = email,
            Type = InvestorType.NaturalPerson,
            Status = InvestorStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        investor.RaiseDomainEvent(new InvestorOnboardedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            investor.Id,
            investor.Name,
            InvestorType.NaturalPerson));

        return investor;
    }

    public static ErrorOr<Investor> CreateLegalEntity(
        Cnpj cnpj,
        string companyName,
        Email email)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            return InvestorErrors.InvalidName;

        var investor = new Investor(Guid.NewGuid())
        {
            Cnpj = cnpj,
            Name = companyName,
            Email = email,
            Type = InvestorType.LegalEntity,
            Status = InvestorStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        investor.RaiseDomainEvent(new InvestorOnboardedDomainEvent(
            Guid.NewGuid(),
            DateTime.UtcNow,
            investor.Id,
            investor.Name,
            InvestorType.LegalEntity));

        return investor;
    }

    public ErrorOr<Updated> Approve()
    {
        if (Status == InvestorStatus.Active)
            return InvestorErrors.AlreadyActive;

        Status = InvestorStatus.Active;
        UpdatedAt = DateTime.UtcNow;
        return Result.Updated;
    }

    public ErrorOr<Updated> Suspend()
    {
        if (Status != InvestorStatus.Active)
            return InvestorErrors.NotActive;

        Status = InvestorStatus.Suspended;
        UpdatedAt = DateTime.UtcNow;
        return Result.Updated;
    }
}
