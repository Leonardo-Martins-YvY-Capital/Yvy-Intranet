using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Domain.Repositories;

public interface IKanbanCardRepository
{
    /// <summary>Idempotency check — a Graph message must never create two cards.</summary>
    Task<bool> ExistsByMessageIdAsync(string messageId, CancellationToken ct = default);

    Task AddAsync(KanbanCard card, CancellationToken ct = default);

    // Read methods (GetByIdAsync, ListByProcessAsync) are added with the board slice (Slice 2).
}
