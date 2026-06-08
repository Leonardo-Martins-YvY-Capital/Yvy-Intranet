using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using Yvy.Application.Abstractions;
using Yvy.Application.KanbanCards.Commands.CreateCardFromEmail;
using Yvy.Domain.Errors;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Infrastructure.Inbound;

/// <summary>
/// Drains the <c>InboundEmailNotification</c> durable queue into <c>KanbanCard</c>s (email-ingestion-spec
/// §4). Mirrors <c>ProcessOutboxMessagesJob</c>: <see cref="DisallowConcurrentExecutionAttribute"/>,
/// a bounded batch, per-row try/catch so one bad message can't stall the batch, and a single
/// <c>SaveChangesAsync</c>. The <c>CreateCardFromEmailCommand</c> handler is idempotent
/// (<c>ExistsByMessageIdAsync</c>), so replays are safe.
/// </summary>
[DisallowConcurrentExecution]
public sealed class ProcessInboundEmailsJob : IJob
{
    private const int BatchSize = 20;

    private readonly YvyDbContext _context;
    private readonly IInboundEmailGateway _gateway;
    private readonly ISender _sender;
    private readonly IProcessTypeRouter _router;
    private readonly ILogger<ProcessInboundEmailsJob> _logger;

    public ProcessInboundEmailsJob(
        YvyDbContext context,
        IInboundEmailGateway gateway,
        ISender sender,
        IProcessTypeRouter router,
        ILogger<ProcessInboundEmailsJob> logger)
    {
        _context = context;
        _gateway = gateway;
        _sender = sender;
        _router = router;
        _logger = logger;
    }

    public Task Execute(IJobExecutionContext context) => ProcessBatchAsync(context.CancellationToken);

    /// <summary>Core batch logic, exposed so integration tests can drive it deterministically
    /// instead of waiting on the Quartz timer.</summary>
    public async Task ProcessBatchAsync(CancellationToken ct = default)
    {
        var notifications = await _context.InboundEmailNotifications
            .Where(n => n.ProcessedOn == null)
            .OrderBy(n => n.ReceivedAt)
            .Take(BatchSize)
            .ToListAsync(ct);

        foreach (var notification in notifications)
        {
            try
            {
                var message = await _gateway.GetMessageAsync(notification.MessageId, ct);
                if (message.IsError)
                {
                    notification.Error = message.FirstError.Description;
                    continue;
                }

                var process = _router.Resolve(message.Value);
                var result = await _sender.Send(new CreateCardFromEmailCommand(process, message.Value), ct);

                // A duplicate is the idempotent happy path — the card already exists, so we're done.
                if (result.IsError && result.FirstError != KanbanCardErrors.DuplicateEmail)
                {
                    notification.Error = result.FirstError.Description;
                    continue;
                }

                notification.ProcessedOn = DateTime.UtcNow;
                notification.Error = null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing inbound notification {NotificationId}", notification.Id);
                notification.Error = ex.Message;
            }
        }

        await _context.SaveChangesAsync(ct);
    }
}
