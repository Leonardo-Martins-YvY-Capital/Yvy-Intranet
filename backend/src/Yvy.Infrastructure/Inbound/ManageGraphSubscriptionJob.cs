using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quartz;
using Yvy.Application.Abstractions;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Keeps an active Microsoft Graph mail subscription alive (email-ingestion-spec §5). Graph mail
/// subscriptions are short-lived and must be renewed before expiry. This job queries Graph each run
/// (no local persistence): if no subscription exists it creates one; if one is near expiry it renews
/// it — restart-safe with no orphaned subscriptions.
/// <para>
/// A no-op unless <c>MicrosoftGraph:Enabled</c>, so dev/test runs (simulated gateway) need no tenant.
/// </para>
/// </summary>
[DisallowConcurrentExecution]
public sealed class ManageGraphSubscriptionJob : IJob
{
    // Renew when the subscription has less than this slice of its lifetime remaining.
    private static readonly TimeSpan RenewalMargin = TimeSpan.FromHours(12);

    private readonly IInboundEmailGateway _gateway;
    private readonly MicrosoftGraphOptions _options;
    private readonly ILogger<ManageGraphSubscriptionJob> _logger;

    public ManageGraphSubscriptionJob(
        IInboundEmailGateway gateway,
        IOptions<MicrosoftGraphOptions> options,
        ILogger<ManageGraphSubscriptionJob> logger)
    {
        _gateway = gateway;
        _options = options.Value;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        if (!_options.Enabled)
            return;

        var ct = context.CancellationToken;

        var subscriptions = await _gateway.ListSubscriptionsAsync(ct);
        if (subscriptions.IsError)
        {
            _logger.LogError("Could not list Graph subscriptions: {Error}", subscriptions.FirstError.Code);
            return;
        }

        // App-only context returns only this app's subscriptions; treat any active one as ours.
        var active = subscriptions.Value
            .OrderByDescending(s => s.ExpiresAt)
            .FirstOrDefault();

        if (active is null)
        {
            var created = await _gateway.CreateSubscriptionAsync(ct);
            if (created.IsError)
                _logger.LogError("Failed to create Graph subscription: {Error}", created.FirstError.Code);
            else
                _logger.LogInformation("Created Graph subscription expiring {ExpiresAt:o}", created.Value.ExpiresAt);
            return;
        }

        if (active.ExpiresAt - DateTime.UtcNow <= RenewalMargin)
        {
            var renewed = await _gateway.RenewSubscriptionAsync(active.SubscriptionId, ct);
            if (renewed.IsError)
                _logger.LogError("Failed to renew Graph subscription: {Error}", renewed.FirstError.Code);
            else
                _logger.LogInformation("Renewed Graph subscription to {ExpiresAt:o}", renewed.Value.ExpiresAt);
        }
    }
}
