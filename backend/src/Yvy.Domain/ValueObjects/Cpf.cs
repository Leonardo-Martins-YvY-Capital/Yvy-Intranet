using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class Cpf : ValueObject
{
    private Cpf() { }

    public string Value { get; private init; } = null!;

    public string Formatted =>
        $"{Value[..3]}.{Value[3..6]}.{Value[6..9]}-{Value[9..]}";

    public static ErrorOr<Cpf> Create(string value)
    {
        var digits = new string(value.Where(char.IsDigit).ToArray());

        if (!IsValid(digits))
            return Error.Validation("Cpf.InvalidFormat", "CPF is invalid.");

        return new Cpf { Value = digits };
    }

    private static bool IsValid(string digits)
    {
        if (digits.Length != 11) return false;
        if (digits.Distinct().Count() == 1) return false;

        return ValidateDigit(digits, 9) && ValidateDigit(digits, 10);
    }

    private static bool ValidateDigit(string digits, int position)
    {
        var sum = 0;
        for (var i = 0; i < position; i++)
            sum += (digits[i] - '0') * (position + 1 - i);

        var remainder = sum % 11;
        var expectedDigit = remainder < 2 ? 0 : 11 - remainder;
        return (digits[position] - '0') == expectedDigit;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
