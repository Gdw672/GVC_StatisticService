using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GVC_StatisticService.Migrations
{
    /// <inheritdoc />
    public partial class fixReportDataTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
        @"ALTER TABLE reports ALTER COLUMN ""ТЗ"" TYPE double precision USING ""ТЗ""::double precision;
          ALTER TABLE reports ALTER COLUMN ""ТЗ"" DROP NOT NULL;");
            migrationBuilder.Sql(
    @"ALTER TABLE reports ALTER COLUMN ""Порядок"" TYPE integer USING ""Порядок""::integer;
      ALTER TABLE reports ALTER COLUMN ""Порядок"" DROP NOT NULL;");

            migrationBuilder.Sql(
    @"ALTER TABLE reports ALTER COLUMN ""Доля"" TYPE double precision USING ""Доля""::double precision;
      ALTER TABLE reports ALTER COLUMN ""Доля"" DROP NOT NULL;");

            migrationBuilder.Sql(
     @"ALTER TABLE reports ALTER COLUMN ""Вр__создания_обращения_с_учетом_ЗО_инициатора"" TYPE timestamp with time zone USING ""Вр__создания_обращения_с_учетом_ЗО_инициатора""::timestamp with time zone;
      ALTER TABLE reports ALTER COLUMN ""Вр__создания_обращения_с_учетом_ЗО_инициатора"" DROP NOT NULL;");


            migrationBuilder.Sql(
     @"ALTER TABLE reports ALTER COLUMN ""Вр__создания_обращения"" TYPE timestamp with time zone USING ""Вр__создания_обращения""::timestamp with time zone;
      ALTER TABLE reports ALTER COLUMN ""Вр__создания_обращения"" DROP NOT NULL;");

            migrationBuilder.Sql(
                @"ALTER TABLE reports ALTER COLUMN ""ВРЕМЯ_ЗАКРЫТИЯ"" TYPE timestamp with time zone USING ""ВРЕМЯ_ЗАКРЫТИЯ""::timestamp with time zone;
      ALTER TABLE reports ALTER COLUMN ""ВРЕМЯ_ЗАКРЫТИЯ"" DROP NOT NULL;");

            migrationBuilder.Sql(
                @"ALTER TABLE reports ALTER COLUMN ""ВОЗВРАЩЕНО_ОШИБОЧНО"" TYPE boolean USING ""ВОЗВРАЩЕНО_ОШИБОЧНО""::boolean;
      ALTER TABLE reports ALTER COLUMN ""ВОЗВРАЩЕНО_ОШИБОЧНО"" DROP NOT NULL;");

            migrationBuilder.Sql(
                @"ALTER TABLE reports ALTER COLUMN ""ВОЗВРАЩЕНО"" TYPE boolean USING ""ВОЗВРАЩЕНО""::boolean;
      ALTER TABLE reports ALTER COLUMN ""ВОЗВРАЩЕНО"" DROP NOT NULL;");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ТЗ",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Порядок",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Доля",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Вр__создания_обращения_с_учетом_ЗО_инициатора",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Вр__создания_обращения",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ВРЕМЯ_ЗАКРЫТИЯ",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ВОЗВРАЩЕНО_ОШИБОЧНО",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ВОЗВРАЩЕНО",
                table: "reports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);
        }
    }
}
