using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Yvy.Application.Abstractions;
using Yvy.Domain.Repositories;
using Yvy.Infrastructure.Inbound;
using Yvy.Infrastructure.Outbox;
using Yvy.Infrastructure.Persistence;
using Yvy.Infrastructure.Persistence.Repositories;

namespace Yvy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<YvyDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(YvyDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IFundRepository, FundRepository>();
        services.AddScoped<IInvestorRepository, InvestorRepository>();
        services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
        services.AddScoped<IKanbanCardRepository, KanbanCardRepository>();

        // --- Email ingestion (Kanban Slice 1) ---
        services.Configure<MicrosoftGraphOptions>(
            configuration.GetSection(MicrosoftGraphOptions.SectionName));

        services.AddScoped<IProcessTypeRouter, DefaultProcessTypeRouter>();

        // Gateway selected by config: the real Graph client only when explicitly enabled and
        // provisioned; otherwise the simulated gateway (default) so dev/test need no Entra tenant.
        var graphEnabled = configuration.GetValue<bool>($"{MicrosoftGraphOptions.SectionName}:Enabled");
        if (graphEnabled)
        {
            services.AddHttpClient<IInboundEmailGateway, GraphInboundEmailGateway>(client =>
                client.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/"));
        }
        else
        {
            services.AddScoped<IInboundEmailGateway, SimulatedInboundEmailGateway>();
        }

        services.AddQuartz(q =>
        {
            var outboxJobKey = new JobKey(nameof(ProcessOutboxMessagesJob));
            q.AddJob<ProcessOutboxMessagesJob>(opts => opts.WithIdentity(outboxJobKey));
            q.AddTrigger(opts => opts
                .ForJob(outboxJobKey)
                .WithIdentity($"{nameof(ProcessOutboxMessagesJob)}-trigger")
                .WithSimpleSchedule(s => s
                    .WithIntervalInSeconds(10)
                    .RepeatForever()));

            var inboundJobKey = new JobKey(nameof(ProcessInboundEmailsJob));
            q.AddJob<ProcessInboundEmailsJob>(opts => opts.WithIdentity(inboundJobKey));
            q.AddTrigger(opts => opts
                .ForJob(inboundJobKey)
                .WithIdentity($"{nameof(ProcessInboundEmailsJob)}-trigger")
                .WithSimpleSchedule(s => s
                    .WithIntervalInSeconds(10)
                    .RepeatForever()));

            // Subscription lifecycle only matters live; runs less often and no-ops when disabled.
            var subscriptionJobKey = new JobKey(nameof(ManageGraphSubscriptionJob));
            q.AddJob<ManageGraphSubscriptionJob>(opts => opts.WithIdentity(subscriptionJobKey));
            q.AddTrigger(opts => opts
                .ForJob(subscriptionJobKey)
                .WithIdentity($"{nameof(ManageGraphSubscriptionJob)}-trigger")
                .WithSimpleSchedule(s => s
                    .WithIntervalInMinutes(5)
                    .RepeatForever()));
        });

        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        return services;
    }
}
