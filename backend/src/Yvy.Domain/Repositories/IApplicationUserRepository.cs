using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Repositories;

public interface IApplicationUserRepository
{
    Task<ApplicationUser?> GetByEntraObjectIdAsync(EntraObjectId entraObjectId, CancellationToken ct = default);
    Task AddAsync(ApplicationUser user, CancellationToken ct = default);
}
