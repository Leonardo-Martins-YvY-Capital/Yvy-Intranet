using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Yvy.Application.Abstractions;
using Yvy.Domain.Repositories;
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

        services.AddQuartz(q =>
        {
            var jobKey = new JobKey(nameof(ProcessOutboxMessagesJob));

            q.AddJob<ProcessOutboxMessagesJob>(opts => opts.WithIdentity(jobKey));

            q.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity($"{nameof(ProcessOutboxMessagesJob)}-trigger")
                .WithSimpleSchedule(s => s
                    .WithIntervalInSeconds(10)
                    .RepeatForever()));
        });

        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        return services;
    }
}
