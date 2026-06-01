using Microsoft.EntityFrameworkCore;
using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Infrastructure.Persistence.Repositories;

public sealed class FundRepository : IFundRepository
{
    private readonly YvyDbContext _context;

    public FundRepository(YvyDbContext context) => _context = context;

    public Task<Fund?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _context.Funds.FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<Fund?> GetByCodeAsync(FundCode code, CancellationToken ct = default) =>
        await _context.Funds.FirstOrDefaultAsync(
            f => f.Code.Value == code.Value, ct);

    public async Task<bool> ExistsByCodeAsync(FundCode code, CancellationToken ct = default) =>
        await _context.Funds.AnyAsync(
            f => f.Code.Value == code.Value, ct);

    public async Task<IReadOnlyList<Fund>> ListAsync(CancellationToken ct = default) =>
        await _context.Funds.ToListAsync(ct);

    public async Task AddAsync(Fund fund, CancellationToken ct = default) =>
        await _context.Funds.AddAsync(fund, ct);
}
