using ErrorOr;
using Yvy.Application.Abstractions;
using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.Errors;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Application.Funds.Commands.CreateFund;

public sealed class CreateFundCommandHandler : ICommandHandler<CreateFundCommand, Guid>
{
    private readonly IFundRepository _fundRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFundCommandHandler(
        IFundRepository fundRepository,
        IUnitOfWork unitOfWork)
    {
        _fundRepository = fundRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ErrorOr<Guid>> Handle(
        CreateFundCommand request,
        CancellationToken cancellationToken)
    {
        var codeResult = FundCode.Create(request.Code);
        if (codeResult.IsError) return codeResult.Errors;

        var moneyResult = Money.Create(request.MinimumInvestmentAmount, request.MinimumInvestmentCurrency);
        if (moneyResult.IsError) return moneyResult.Errors;

        if (!Enum.TryParse<FundType>(request.FundType, ignoreCase: true, out var fundType))
            return FundErrors.InvalidFundType;

        var fundResult = Fund.Create(codeResult.Value, request.Name, fundType, moneyResult.Value);
        if (fundResult.IsError) return fundResult.Errors;

        var fund = fundResult.Value;

        if (await _fundRepository.ExistsByCodeAsync(fund.Code, cancellationToken))
            return FundErrors.CodeAlreadyExists;

        await _fundRepository.AddAsync(fund, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return fund.Id;
    }
}
