namespace Yvy.Application.Funds.DTOs;

public sealed record FundResponse(
    Guid Id,
    string Code,
    string Name,
    string Type,
    string Status,
    decimal MinimumInvestmentAmount,
    string MinimumInvestmentCurrency,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
