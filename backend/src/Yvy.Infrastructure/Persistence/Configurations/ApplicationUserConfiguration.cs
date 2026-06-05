using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Yvy.Domain.Aggregates.Users;

namespace Yvy.Infrastructure.Persistence.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("application_users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");

        builder.Property(u => u.Upn)
            .HasColumnName("upn")
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(u => u.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(u => u.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(u => u.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(u => u.LastLoginAt).HasColumnName("last_login_at");

        // Entra oid — the stable external key. Unique.
        builder.OwnsOne(u => u.EntraObjectId, oid =>
        {
            oid.Property(o => o.Value)
                .HasColumnName("entra_object_id")
                .HasMaxLength(36)
                .IsRequired();

            oid.HasIndex(o => o.Value)
                .IsUnique()
                .HasDatabaseName("ix_application_users_entra_object_id");
        });

        builder.OwnsOne(u => u.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("email")
                .HasMaxLength(320)
                .IsRequired();
        });

        // Roles: a small set persisted as a comma-joined string. A value comparer is required
        // because EF tracks a mutable collection behind a scalar conversion.
        var rolesConverter = new ValueConverter<IReadOnlySet<Role>, string>(
            roles => string.Join(',', roles.Select(r => r.ToString())),
            value => value
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(Enum.Parse<Role>)
                .ToHashSet());

        var rolesComparer = new ValueComparer<IReadOnlySet<Role>>(
            (a, b) => a!.SetEquals(b!),
            roles => roles.Aggregate(0, (hash, r) => HashCode.Combine(hash, r.GetHashCode())),
            roles => roles.ToHashSet());

        builder.Property(u => u.Roles)
            .HasConversion(rolesConverter, rolesComparer)
            .HasColumnName("roles")
            .HasMaxLength(200)
            .IsRequired()
            .HasField("_roles")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
