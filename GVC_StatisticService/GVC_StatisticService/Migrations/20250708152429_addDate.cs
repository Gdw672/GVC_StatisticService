using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GVC_StatisticService.Migrations
{
    /// <inheritdoc />
    public partial class addDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "дата",
                table: "countReports");

            migrationBuilder.AddColumn<DateTime>(
                name: "дата_отчета",
                table: "reports",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "дата_отчета",
                table: "countReports",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "дата_отчета",
                table: "reports");

            migrationBuilder.DropColumn(
                name: "дата_отчета",
                table: "countReports");

            migrationBuilder.AddColumn<DateTime>(
                name: "дата",
                table: "countReports",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
