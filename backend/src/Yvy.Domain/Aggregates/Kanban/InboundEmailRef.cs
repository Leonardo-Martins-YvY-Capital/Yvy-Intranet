using ErrorOr;
using Yvy.Domain.Primitives;

namespace Yvy.Domain.Aggregates.Kanban;

/// <summary>
/// Reference to the inbound email a card was born from. Equality is by <see cref="MessageId"/> — the
/// Graph message id and the natural key that drives ingestion idempotency.
/// (Attachments + raw-body storage are added in a later step once the storage target is decided —
/// kanban-card-spec §3/§11.)
/// </summary>
public sealed class InboundEmailRef : ValueObject
{
    private InboundEmailRef() { }

    public string MessageId { get; private init; } = null!;
    public string From { get; private init; } = null!;
    public string Subject { get; private init; } = null!;
    public DateTime ReceivedAt { get; private init; }
    public string? BodyPreview { get; private init; }
    public string? RawBodyRef { get; private init; }

    public static ErrorOr<InboundEmailRef> Create(
        string messageId,
        string from,
        string subject,
        DateTime receivedAtUtc,
        string? bodyPreview = null,
        string? rawBodyRef = null)
    {
        if (string.IsNullOrWhiteSpace(messageId))
            return Error.Validation("InboundEmailRef.MessageIdEmpty", "Email MessageId cannot be empty.");

        return new InboundEmailRef
        {
            MessageId = messageId,
            From = from ?? string.Empty,
            Subject = subject ?? string.Empty,
            ReceivedAt = receivedAtUtc,
            BodyPreview = bodyPreview,
            RawBodyRef = rawBodyRef,
        };
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return MessageId;
    }
}
