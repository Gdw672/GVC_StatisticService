using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GVC_StatisticService.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Обращение = table.Column<string>(type: "text", nullable: false),
                    Вр__создания_обращения = table.Column<string>(type: "text", nullable: false),
                    Вр__создания_обращения_с_учетом_ЗО_инициатора = table.Column<string>(type: "text", nullable: false),
                    ВРЕМЯ_ЗАКРЫТИЯ = table.Column<string>(type: "text", nullable: false),
                    IP_адрес = table.Column<string>(type: "text", nullable: false),
                    РПА = table.Column<string>(type: "text", nullable: false),
                    Доля = table.Column<string>(type: "text", nullable: false),
                    ТЗ = table.Column<string>(type: "text", nullable: false),
                    Порядок = table.Column<string>(type: "text", nullable: false),
                    Объект = table.Column<string>(type: "text", nullable: false),
                    Наряд = table.Column<string>(type: "text", nullable: false),
                    Направление_РГ = table.Column<string>(type: "text", nullable: false),
                    Рабочая_группа = table.Column<string>(type: "text", nullable: false),
                    Исполнитель = table.Column<string>(type: "text", nullable: false),
                    Полигон_инициатора = table.Column<string>(type: "text", nullable: false),
                    ФИО = table.Column<string>(type: "text", nullable: false),
                    Подразделение_инициатора = table.Column<string>(type: "text", nullable: false),
                    Способ_обращения = table.Column<string>(type: "text", nullable: false),
                    Причина_обращения = table.Column<string>(type: "text", nullable: false),
                    АСОЗ = table.Column<string>(type: "text", nullable: false),
                    ВП = table.Column<string>(type: "text", nullable: false),
                    ОСК = table.Column<string>(type: "text", nullable: false),
                    Услуга = table.Column<string>(type: "text", nullable: false),
                    ЭК_запроса_наряда = table.Column<string>(type: "text", nullable: false),
                    Направление_проблем = table.Column<string>(type: "text", nullable: false),
                    ЭК_робота = table.Column<string>(type: "text", nullable: false),
                    Код_мероприятия_РРО = table.Column<string>(type: "text", nullable: false),
                    Шаблон_запроса = table.Column<string>(type: "text", nullable: false),
                    ВОЗВРАЩЕНО = table.Column<string>(type: "text", nullable: false),
                    ВОЗВРАЩЕНО_ОШИБОЧНО = table.Column<string>(type: "text", nullable: false),
                    КРАТКОЕ_ОПИСАНИЕ = table.Column<string>(type: "text", nullable: false),
                    ПОДРОБНОЕ_ОПИСАНИЕ = table.Column<string>(type: "text", nullable: false),
                    РЕШЕНИЕ = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reports", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reports");
        }
    }
}
