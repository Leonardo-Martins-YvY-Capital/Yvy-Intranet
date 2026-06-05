using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Yvy.Infrastructure.Inbound;

namespace Yvy.Infrastructure.Persistence.Configurations;

public sealed class InboundEmailNotificationConfiguration : IEntityTypeConfiguration<InboundEmailNotification>
{
    public void Configure(EntityTypeBuilder<InboundEmailNotification> builder)
    {
        builder.ToTable("inbound_email_notifications");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).HasColumnName("id");

        builder.Property(n => n.MessageId)
            .HasColumnName("message_id")
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(n => n.SubscriptionId).HasColumnName("subscription_id").HasMaxLength(200);
        builder.Property(n => n.ReceivedAt).HasColumnName("received_at").IsRequired();
        builder.Property(n => n.ProcessedOn).HasColumnName("processed_on");
        builder.Property(n => n.Error).HasColumnName("error");

        builder.HasIndex(n => n.MessageId)
            .IsUnique()
            .HasDatabaseName("ix_inbound_email_notifications_message_id");
    }
}
