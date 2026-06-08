namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Durable queue row for an inbound Graph change-notification. Persisted fast by the webhook (return
/// 202), then drained by <c>ProcessInboundEmailsJob</c>. Dedup by <see cref="MessageId"/> (unique
/// index) defends against duplicate delivery / replay. A plain infrastructure entity — no domain
/// behaviour (email-ingestion-spec §8).
/// </summary>
public sealed class InboundEmailNotification
{
    public Guid Id { get; set; }
    public string MessageId { get; set; } = null!;
    public string? SubscriptionId { get; set; }
    public DateTime ReceivedAt { get; set; }
    public DateTime? ProcessedOn { get; set; }
    public string? Error { get; set; }
}
