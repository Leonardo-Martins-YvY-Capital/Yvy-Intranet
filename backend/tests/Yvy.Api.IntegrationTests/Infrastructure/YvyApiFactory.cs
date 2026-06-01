using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Respawn;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Api.IntegrationTests.Infrastructure;

public sealed class YvyApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgresContainerFixture _postgres = new();
    private Respawner _respawner = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<YvyDbContext>>();
            services.AddDbContext<YvyDbContext>(options =>
                options.UseNpgsql(_postgres.ConnectionString));
        });
    }

    public async Task InitializeAsync()
    {
        await _postgres.InitializeAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();
        await db.Database.MigrateAsync();

        _respawner = await Respawner.CreateAsync(
            _postgres.ConnectionString,
            new RespawnerOptions { DbAdapter = DbAdapter.Postgres });
    }

    public Task ResetDatabaseAsync() =>
        _respawner.ResetAsync(_postgres.ConnectionString);

    public new async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await base.DisposeAsync();
    }
}
