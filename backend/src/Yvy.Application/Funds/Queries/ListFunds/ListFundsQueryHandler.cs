using ErrorOr;
using Yvy.Application.Abstractions;
using Yvy.Application.Funds.DTOs;
using Yvy.Domain.Repositories;

namespace Yvy.Application.Funds.Queries.ListFunds;

public sealed class ListFundsQueryHandler : IQueryHandler<ListFundsQuery, IReadOnlyList<FundResponse>>
{
    private readonly IFundRepository _fundRepository;

    public ListFundsQueryHandler(IFundRepository fundRepository) =>
        _fundRepository = fundRepository;

    public async Task<ErrorOr<IReadOnlyList<FundResponse>>> Handle(
        ListFundsQuery request,
        CancellationToken cancellationToken)
    {
        var funds = await _fundRepository.ListAsync(cancellationToken);

        return funds.Select(f => new FundResponse(
            f.Id,
            f.Code.Value,
            f.Name,
            f.Type.ToString(),
            f.Status.ToString(),
            f.MinimumInvestment.Amount,
            f.MinimumInvestment.Currency,
            f.CreatedAt,
            f.UpdatedAt)).ToList();
    }
}
