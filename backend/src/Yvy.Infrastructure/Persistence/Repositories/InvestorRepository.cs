using Microsoft.EntityFrameworkCore;
using Yvy.Domain.Aggregates.Investors;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Infrastructure.Persistence.Repositories;

public sealed class InvestorRepository : IInvestorRepository
{
    private readonly YvyDbContext _context;

    public InvestorRepository(YvyDbContext context) => _context = context;

    public Task<Investor?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _context.Investors.FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<Investor?> GetByCpfAsync(Cpf cpf, CancellationToken ct = default) =>
        await _context.Investors.FirstOrDefaultAsync(
            i => i.Cpf != null && i.Cpf.Value == cpf.Value, ct);

    public async Task<Investor?> GetByCnpjAsync(Cnpj cnpj, CancellationToken ct = default) =>
        await _context.Investors.FirstOrDefaultAsync(
            i => i.Cnpj != null && i.Cnpj.Value == cnpj.Value, ct);

    public async Task<bool> ExistsByCpfAsync(Cpf cpf, CancellationToken ct = default) =>
        await _context.Investors.AnyAsync(
            i => i.Cpf != null && i.Cpf.Value == cpf.Value, ct);

    public async Task<bool> ExistsByCnpjAsync(Cnpj cnpj, CancellationToken ct = default) =>
        await _context.Investors.AnyAsync(
            i => i.Cnpj != null && i.Cnpj.Value == cnpj.Value, ct);

    public async Task<IReadOnlyList<Investor>> ListAsync(CancellationToken ct = default) =>
        await _context.Investors.ToListAsync(ct);

    public async Task AddAsync(Investor investor, CancellationToken ct = default) =>
        await _context.Investors.AddAsync(investor, ct);
}
