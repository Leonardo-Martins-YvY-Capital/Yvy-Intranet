using Microsoft.EntityFrameworkCore;
using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.Aggregates.Investors;
using Yvy.Domain.Primitives;
using Yvy.Infrastructure.Outbox;
using Newtonsoft.Json;

namespace Yvy.Infrastructure.Persistence;

public sealed class YvyDbContext : DbContext
{
    public YvyDbContext(DbContextOptions<YvyDbContext> options) : base(options) { }

    public DbSet<Fund> Funds => Set<Fund>();
    public DbSet<Investor> Investors => Set<Investor>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(YvyDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ConvertDomainEventsToOutboxMessages();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ConvertDomainEventsToOutboxMessages()
    {
        var domainEvents = ChangeTracker
            .Entries<AggregateRoot>()
            .Select(e => e.Entity)
            .SelectMany(a =>
            {
                var events = a.DomainEvents;
                a.ClearDomainEvents();
                return events;
            })
            .Select(e => new OutboxMessage
            {
                Id = e.EventId,
                Type = e.GetType().AssemblyQualifiedName!,
                Content = JsonConvert.SerializeObject(e, new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                }),
                OccurredOn = e.OccurredOn
            })
            .ToList();

        OutboxMessages.AddRange(domainEvents);
    }
}
