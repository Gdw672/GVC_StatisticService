using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GVC_StatisticService.Migrations
{
    /// <inheritdoc />
    public partial class AddSmt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "процент_роботов",
                table: "countReports",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "процент_роботов",
                table: "countReports");
        }
    }
}
