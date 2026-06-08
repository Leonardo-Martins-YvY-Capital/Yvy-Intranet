using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Infrastructure.Persistence.Configurations;

public sealed class KanbanCardConfiguration : IEntityTypeConfiguration<KanbanCard>
{
    public void Configure(EntityTypeBuilder<KanbanCard> builder)
    {
        builder.ToTable("kanban_cards");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");

        builder.Property(c => c.ProcessType)
            .HasColumnName("process_type")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(c => c.Phase)
            .HasColumnName("phase")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(c => c.Title)
            .HasColumnName("title")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(c => c.Payee).HasColumnName("payee").HasMaxLength(300);
        builder.Property(c => c.DueDate).HasColumnName("due_date");
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");

        // Amount — optional Money (BRL, decimal).
        builder.OwnsOne(c => c.Amount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("amount")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("amount_currency")
                .HasMaxLength(3);
        });

        // Email — the source-of-truth reference; MessageId is unique (idempotency).
        builder.OwnsOne(c => c.Email, email =>
        {
            email.Property(e => e.MessageId)
                .HasColumnName("email_message_id")
                .HasMaxLength(512)
                .IsRequired();

            email.Property(e => e.From)
                .HasColumnName("email_from")
                .HasMaxLength(320)
                .IsRequired();

            email.Property(e => e.Subject)
                .HasColumnName("email_subject")
                .HasMaxLength(998)
                .IsRequired();

            email.Property(e => e.ReceivedAt).HasColumnName("email_received_at").IsRequired();
            email.Property(e => e.BodyPreview).HasColumnName("email_body_preview").HasMaxLength(2000);
            email.Property(e => e.RawBodyRef).HasColumnName("email_raw_body_ref").HasMaxLength(1024);

            email.HasIndex(e => e.MessageId)
                .IsUnique()
                .HasDatabaseName("ix_kanban_cards_email_message_id");
        });
    }
}
