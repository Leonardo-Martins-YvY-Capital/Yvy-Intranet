using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class Money : ValueObject
{
    private Money() { }

    public decimal Amount { get; private init; }
    public string Currency { get; private init; } = "BRL";

    public static readonly Money Zero = new() { Amount = 0m, Currency = "BRL" };

    public static ErrorOr<Money> Create(decimal amount, string currency = "BRL")
    {
        if (amount < 0)
            return Error.Validation("Money.NegativeAmount", "Amount cannot be negative.");

        if (string.IsNullOrWhiteSpace(currency))
            return Error.Validation("Money.InvalidCurrency", "Currency cannot be empty.");

        return new Money { Amount = amount, Currency = currency.ToUpperInvariant() };
    }

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException(
                $"Cannot add money with different currencies: {a.Currency} and {b.Currency}.");

        return new Money { Amount = a.Amount + b.Amount, Currency = a.Currency };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
