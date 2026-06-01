using Yvy.Application.Abstractions;
using Yvy.Application.Funds.DTOs;

namespace Yvy.Application.Funds.Queries.GetFundById;

public sealed record GetFundByIdQuery(Guid Id) : IQuery<FundResponse>;
