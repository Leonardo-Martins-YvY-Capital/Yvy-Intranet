using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.ValueObjects;

/// <summary>
/// The Entra ID <c>oid</c> claim — the stable, immutable external key for a staff identity.
/// Always a non-empty GUID; normalized to canonical lowercase so case never affects equality.
/// </summary>
public sealed class EntraObjectId : ValueObject
{
    private EntraObjectId() { }

    public string Value { get; private init; } = null!;

    public static ErrorOr<EntraObjectId> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("EntraObjectId.Empty", "Entra object id cannot be empty.");

        if (!Guid.TryParse(value, out var parsed) || parsed == Guid.Empty)
            return Error.Validation(
                "EntraObjectId.InvalidFormat",
                "Entra object id must be a non-empty GUID.");

        return new EntraObjectId { Value = parsed.ToString("D") };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
