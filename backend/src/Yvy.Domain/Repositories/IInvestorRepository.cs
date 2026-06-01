using Yvy.Domain.Aggregates.Investors;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Repositories;

public interface IInvestorRepository
{
    Task<Investor?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Investor?> GetByCpfAsync(Cpf cpf, CancellationToken ct = default);
    Task<Investor?> GetByCnpjAsync(Cnpj cnpj, CancellationToken ct = default);
    Task<bool> ExistsByCpfAsync(Cpf cpf, CancellationToken ct = default);
    Task<bool> ExistsByCnpjAsync(Cnpj cnpj, CancellationToken ct = default);
    Task<IReadOnlyList<Investor>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Investor investor, CancellationToken ct = default);
}
