using Microsoft.EntityFrameworkCore;
using Yvy.Domain.Aggregates.Users;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Infrastructure.Persistence.Repositories;

public sealed class ApplicationUserRepository : IApplicationUserRepository
{
    private readonly YvyDbContext _context;

    public ApplicationUserRepository(YvyDbContext context) => _context = context;

    public async Task<ApplicationUser?> GetByEntraObjectIdAsync(
        EntraObjectId entraObjectId,
        CancellationToken ct = default) =>
        await _context.ApplicationUsers.FirstOrDefaultAsync(
            u => u.EntraObjectId.Value == entraObjectId.Value, ct);

    public async Task AddAsync(ApplicationUser user, CancellationToken ct = default) =>
        await _context.ApplicationUsers.AddAsync(user, ct);
}
