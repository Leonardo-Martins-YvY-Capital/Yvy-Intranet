using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Npgsql;
using Respawn;
using Yvy.Domain.Aggregates.Users;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Api.IntegrationTests.Infrastructure;

public sealed class YvyApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    /// <summary>The Graph webhook <c>clientState</c> secret tests post with (bound from config below).</summary>
    public const string GraphClientState = "test-client-state-secret";

    private readonly PostgresContainerFixture _postgres = new();
    private NpgsqlConnection _respawnConnection = null!;
    private Respawner _respawner = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MicrosoftGraph:ClientState"] = GraphClientState,
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<YvyDbContext>>();
            services.AddDbContext<YvyDbContext>(options =>
                options.UseNpgsql(_postgres.ConnectionString));
        });

        // Replace Entra JWT with the test scheme (runs after the app's registrations).
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, null);
        });
    }

    /// <summary>A client that authenticates as the given roles via <c>X-Test-*</c> headers.</summary>
    public HttpClient CreateClientAs(
        IEnumerable<Role> roles,
        string oid = "11111111-1111-1111-1111-111111111111",
        string email = "test.user@yvy.capital")
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Oid", oid);
        client.DefaultRequestHeaders.Add("X-Test-Email", email);
        client.DefaultRequestHeaders.Add("X-Test-Name", "Test User");
        client.DefaultRequestHeaders.Add("X-Test-Roles", string.Join(",", roles));
        return client;
    }

    public async Task InitializeAsync()
    {
        await _postgres.InitializeAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();
        await db.Database.MigrateAsync();

        // Respawn's string overload only supports SQL Server; Postgres needs an open DbConnection.
        _respawnConnection = new NpgsqlConnection(_postgres.ConnectionString);
        await _respawnConnection.OpenAsync();
        _respawner = await Respawner.CreateAsync(
            _respawnConnection,
            new RespawnerOptions { DbAdapter = DbAdapter.Postgres });
    }

    public Task ResetDatabaseAsync() =>
        _respawner.ResetAsync(_respawnConnection);

    public new async Task DisposeAsync()
    {
        if (_respawnConnection is not null)
            await _respawnConnection.DisposeAsync();
        await _postgres.DisposeAsync();
        await base.DisposeAsync();
    }
}
