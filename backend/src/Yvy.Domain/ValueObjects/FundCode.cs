using System.Text.RegularExpressions;
using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class FundCode : ValueObject
{
    private static readonly Regex Pattern =
        new(@"^[A-Z]{4,6}\d{2}$", RegexOptions.Compiled);

    private FundCode() { }

    public string Value { get; private init; } = null!;

    public static ErrorOr<FundCode> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("FundCode.Empty", "Fund code cannot be empty.");

        var normalized = value.ToUpperInvariant();

        if (!Pattern.IsMatch(normalized))
            return Error.Validation(
                "FundCode.InvalidFormat",
                "Fund code must be 4-6 uppercase letters followed by 2 digits (e.g. YVYQ11).");

        return new FundCode { Value = normalized };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
