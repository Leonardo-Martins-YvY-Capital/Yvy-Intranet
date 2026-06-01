using System.Text.RegularExpressions;
using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

public sealed class Email : ValueObject
{
    private static readonly Regex Pattern =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private Email() { }

    public string Value { get; private init; } = null!;

    public static ErrorOr<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("Email.Empty", "Email cannot be empty.");

        if (!Pattern.IsMatch(value))
            return Error.Validation("Email.InvalidFormat", "Email format is invalid.");

        return new Email { Value = value.ToLowerInvariant() };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
