using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Repositories;

public interface IFundRepository
{
    Task<Fund?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Fund?> GetByCodeAsync(FundCode code, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(FundCode code, CancellationToken ct = default);
    Task<IReadOnlyList<Fund>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Fund fund, CancellationToken ct = default);
}
