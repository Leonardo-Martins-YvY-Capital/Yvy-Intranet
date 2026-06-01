using Yvy.Application.Abstractions;
using Yvy.Application.Funds.DTOs;

namespace Yvy.Application.Funds.Queries.ListFunds;

public sealed record ListFundsQuery : IQuery<IReadOnlyList<FundResponse>>;
