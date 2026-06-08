using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yvy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKanbanCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inbound_email_notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    subscription_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    processed_on = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inbound_email_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "kanban_cards",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    process_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    phase = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    email_message_id = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    email_from = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    email_subject = table.Column<string>(type: "character varying(998)", maxLength: 998, nullable: false),
                    email_received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    email_body_preview = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    email_raw_body_ref = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    payee = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    amount_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kanban_cards", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_inbound_email_notifications_message_id",
                table: "inbound_email_notifications",
                column: "message_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_kanban_cards_email_message_id",
                table: "kanban_cards",
                column: "email_message_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inbound_email_notifications");

            migrationBuilder.DropTable(
                name: "kanban_cards");
        }
    }
}
