using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GVC_StatisticService.Migrations
{
    /// <inheritdoc />
    public partial class addReportCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "countReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    входной_поток_всего = table.Column<double>(type: "double precision", nullable: false),
                    цифровые_сервисы_всего = table.Column<double>(type: "double precision", nullable: false),
                    роботы = table.Column<double>(type: "double precision", nullable: false),
                    чат_боты = table.Column<double>(type: "double precision", nullable: false),
                    входной_поток_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    цифровые_сервисы_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    входной_поток_не_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    цифровые_сервисы_не_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    самостоятельность = table.Column<double>(type: "double precision", nullable: false),
                    процент_цифровых_сервисов = table.Column<double>(type: "double precision", nullable: false),
                    процент_чат_ботов = table.Column<double>(type: "double precision", nullable: false),
                    процент_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    процент_не_АС_ОЗ = table.Column<double>(type: "double precision", nullable: false),
                    процент_самостоятельности = table.Column<double>(type: "double precision", nullable: false),
                    дата = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_countReports", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "countReports");
        }
    }
}
