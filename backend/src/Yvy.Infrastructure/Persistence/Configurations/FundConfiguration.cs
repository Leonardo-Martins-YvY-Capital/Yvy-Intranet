using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Yvy.Domain.Aggregates.Funds;

namespace Yvy.Infrastructure.Persistence.Configurations;

public sealed class FundConfiguration : IEntityTypeConfiguration<Fund>
{
    public void Configure(EntityTypeBuilder<Fund> builder)
    {
        builder.ToTable("funds");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasColumnName("id");

        builder.Property(f => f.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(f => f.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(f => f.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(15)
            .IsRequired();

        builder.Property(f => f.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(f => f.UpdatedAt).HasColumnName("updated_at");

        builder.OwnsOne(f => f.Code, code =>
        {
            code.Property(c => c.Value)
                .HasColumnName("code")
                .HasMaxLength(8)
                .IsRequired();

            code.HasIndex(c => c.Value)
                .IsUnique()
                .HasDatabaseName("ix_funds_code");
        });

        builder.OwnsOne(f => f.MinimumInvestment, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("minimum_investment_amount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("minimum_investment_currency")
                .HasMaxLength(3)
                .IsRequired();
        });

    }
}
