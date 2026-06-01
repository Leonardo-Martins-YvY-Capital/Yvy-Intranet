using Yvy.Application.Abstractions;

namespace Yvy.Application.Funds.Commands.CreateFund;

public sealed record CreateFundCommand(
    string Code,
    string Name,
    string FundType,
    decimal MinimumInvestmentAmount,
    string MinimumInvestmentCurrency = "BRL") : ICommand<Guid>;
