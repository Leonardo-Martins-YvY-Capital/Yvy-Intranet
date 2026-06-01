using ErrorOr;
using Yvy.Application.Abstractions;
using Yvy.Application.Funds.DTOs;
using Yvy.Domain.Errors;
using Yvy.Domain.Repositories;

namespace Yvy.Application.Funds.Queries.GetFundById;

public sealed class GetFundByIdQueryHandler : IQueryHandler<GetFundByIdQuery, FundResponse>
{
    private readonly IFundRepository _fundRepository;

    public GetFundByIdQueryHandler(IFundRepository fundRepository) =>
        _fundRepository = fundRepository;

    public async Task<ErrorOr<FundResponse>> Handle(
        GetFundByIdQuery request,
        CancellationToken cancellationToken)
    {
        var fund = await _fundRepository.GetByIdAsync(request.Id, cancellationToken);

        if (fund is null)
            return FundErrors.NotFound;

        return new FundResponse(
            fund.Id,
            fund.Code.Value,
            fund.Name,
            fund.Type.ToString(),
            fund.Status.ToString(),
            fund.MinimumInvestment.Amount,
            fund.MinimumInvestment.Currency,
            fund.CreatedAt,
            fund.UpdatedAt);
    }
}
