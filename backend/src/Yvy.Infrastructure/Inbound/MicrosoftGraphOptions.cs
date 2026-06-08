namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Configuration for the Microsoft Graph email-ingestion integration (email-ingestion-spec §7).
/// Bound from the <c>MicrosoftGraph</c> section in <c>Yvy.Infrastructure/DependencyInjection.cs</c>.
/// <para>
/// Secrets (<see cref="ClientSecret"/>, <see cref="ClientState"/>) come from user-secrets or the
/// environment — <b>never</b> <c>appsettings.json</c> or source control.
/// </para>
/// <para>
/// <see cref="Enabled"/> gates the real <c>GraphInboundEmailGateway</c>: when false (the default),
/// the simulated gateway is used so dev/test runs need no Entra tenant.
/// </para>
/// </summary>
public sealed class MicrosoftGraphOptions
{
    public const string SectionName = "MicrosoftGraph";

    /// <summary>When true, the real Graph gateway is wired and the subscription job runs live.</summary>
    public bool Enabled { get; set; }

    // App-only auth (Entra app registration — Yvy.Graph.Worker, Mail.Read application permission).
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>The finance mailbox, e.g. <c>financeiro@yvy.capital</c>.</summary>
    public string MailboxAddress { get; set; } = string.Empty;

    /// <summary>Shared secret echoed in notifications; validated by the webhook (constant-time).</summary>
    public string ClientState { get; set; } = string.Empty;

    /// <summary>Public HTTPS URL of the webhook endpoint Graph posts notifications to.</summary>
    public string NotificationUrl { get; set; } = string.Empty;

    /// <summary>
    /// Subscription lifetime requested on create/renew, in minutes. Confirm against the current
    /// Graph maximum for mail resources at build time (historically ~4230 min / under 3 days).
    /// </summary>
    public int SubscriptionExpirationMinutes { get; set; } = 4230;
}
