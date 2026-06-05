using Microsoft.EntityFrameworkCore;
using Yvy.Domain.Aggregates.Kanban;
using Yvy.Domain.Repositories;

namespace Yvy.Infrastructure.Persistence.Repositories;

public sealed class KanbanCardRepository : IKanbanCardRepository
{
    private readonly YvyDbContext _context;

    public KanbanCardRepository(YvyDbContext context) => _context = context;

    public Task<bool> ExistsByMessageIdAsync(string messageId, CancellationToken ct = default) =>
        _context.KanbanCards.AnyAsync(c => c.Email.MessageId == messageId, ct);

    public async Task AddAsync(KanbanCard card, CancellationToken ct = default) =>
        await _context.KanbanCards.AddAsync(card, ct);
}
