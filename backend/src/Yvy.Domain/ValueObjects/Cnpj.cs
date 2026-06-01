using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class Cnpj : ValueObject
{
    private Cnpj() { }

    public string Value { get; private init; } = null!;

    public string Formatted =>
        $"{Value[..2]}.{Value[2..5]}.{Value[5..8]}/{Value[8..12]}-{Value[12..]}";

    public static ErrorOr<Cnpj> Create(string value)
    {
        var digits = new string(value.Where(char.IsDigit).ToArray());

        if (!IsValid(digits))
            return Error.Validation("Cnpj.InvalidFormat", "CNPJ is invalid.");

        return new Cnpj { Value = digits };
    }

    private static bool IsValid(string digits)
    {
        if (digits.Length != 14) return false;
        if (digits.Distinct().Count() == 1) return false;

        return ValidateDigit(digits, new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 }, 12) &&
               ValidateDigit(digits, new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 }, 13);
    }

    private static bool ValidateDigit(string digits, int[] weights, int position)
    {
        var sum = weights.Select((w, i) => (digits[i] - '0') * w).Sum();
        var remainder = sum % 11;
        var expected = remainder < 2 ? 0 : 11 - remainder;
        return (digits[position] - '0') == expected;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
