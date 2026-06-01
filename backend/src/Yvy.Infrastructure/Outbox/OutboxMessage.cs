namespace Yvy.Infrastructure.Outbox;

public sealed class OutboxMessage
{
    public Guid Id { get; init; }
    public string Type { get; init; } = null!;
    public string Content { get; init; } = null!;
    public DateTime OccurredOn { get; init; }
    public DateTime? ProcessedOn { get; set; }
    public string? Error { get; set; }
}
