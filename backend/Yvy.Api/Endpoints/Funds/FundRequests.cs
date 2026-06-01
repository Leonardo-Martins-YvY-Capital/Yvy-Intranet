namespace Yvy.Api.Endpoints.Funds;

public sealed record CreateFundRequest(
    string Code,
    string Name,
    string FundType,
    decimal MinimumInvestmentAmount,
    string MinimumInvestmentCurrency = "BRL");
