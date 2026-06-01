using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class Percentage : ValueObject
{
    private Percentage() { }

    public decimal Value { get; private init; }

    public static ErrorOr<Percentage> Create(decimal value)
    {
        if (value is < 0 or > 100)
            return Error.Validation(
                "Percentage.OutOfRange",
                "Percentage must be between 0 and 100.");

        return new Percentage { Value = value };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
