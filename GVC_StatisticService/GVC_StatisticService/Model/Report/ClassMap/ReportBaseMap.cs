using CsvHelper.Configuration;
using CsvHelper.Expressions;
using System.Globalization;

namespace GVC_StatisticService.Model.Report.ClassMap
{
    public class ReportBaseMap : ClassMap<ReportBase>
    {

        public ReportBaseMap() 
        {
            Map(m => m.Обращение)
               .Name("Вр__создания_обращения");

            Map(m => m.IP_адрес)
               .Name("IP_адрес");

            Map(m => m.РПА)
               .Name("РПА");

            Map(m => m.Наряд)
               .Name("Наряд");

            Map(m => m.Объект)
               .Name("Объект");

            Map(m => m.ФИО)
               .Name("ФИО");

            Map(m => m.Направление_РГ)
               .Name("Направление_РГ");

            Map(m => m.Рабочая_группа)
               .Name("Рабочая_группа");

            Map(m => m.Исполнитель)
               .Name("Исполнитель");

            Map(m => m.Полигон_инициатора)
               .Name("Полигон_инициатора");

            Map(m => m.Подразделение_инициатора)
               .Name("Подразделение_инициатора");

            Map(m => m.Способ_обращения)
               .Name("Способ_обращения");

            Map(m => m.Причина_обращения)
               .Name("Причина_обращения");

            Map(m => m.АСОЗ)
               .Name("АСОЗ");

            Map(m => m.ВП)
               .Name("ВП");

            Map(m => m.ОСК)
               .Name("ОСК");

            Map(m => m.Услуга)
               .Name("Услуга");

            Map(m => m.ЭК_запроса_наряда)
               .Name("ЭК_запроса_наряда");

            Map(m => m.Направление_проблем)
               .Name("Направление_проблем");

            Map(m => m.ЭК_робота)
               .Name("ЭК_робота");

            Map(m => m.Код_мероприятия_РРО)
               .Name("Код_мероприятия_РРО");

            Map(m => m.Шаблон_запроса)
               .Name("Шаблон_запроса");

            Map(m => m.КРАТКОЕ_ОПИСАНИЕ)
               .Name("КРАТКОЕ_ОПИСАНИЕ");

            Map(m => m.ПОДРОБНОЕ_ОПИСАНИЕ)
               .Name("ПОДРОБНОЕ_ОПИСАНИЕ");

            Map(m => m.РЕШЕНИЕ)
               .Name("РЕШЕНИЕ");

            Map(m => m.Вр__создания_обращения)
                 .Name("Вр__создания_обращения")
                 .TypeConverterOption.Format("dd.MM.yyyy H:mm:ss");

            Map(m => m.Вр__создания_обращения_с_учетом_ЗО_инициатора)
                .Name("Вр__создания_обращения_с_учетом_ЗО_инициатора")
                .TypeConverterOption.Format("dd.MM.yyyy H:mm:ss");

            Map(m => m.ВРЕМЯ_ЗАКРЫТИЯ)
                .Name("ВРЕМЯ_ЗАКРЫТИЯ")
                .TypeConverterOption.Format("dd.MM.yyyy H:mm:ss");

            Map(m => m.Доля)
                .Name("Доля")
                .TypeConverterOption.CultureInfo(new CultureInfo("ru-RU"));

            Map(m => m.ТЗ)
                .Name("ТЗ")
                .TypeConverterOption.CultureInfo(new CultureInfo("en-US")); // зависит от формата

            Map(m => m.Порядок)
                .Name("Порядок");

            Map(m => m.ВОЗВРАЩЕНО)
                .Name("ВОЗВРАЩЕНО")
                .TypeConverterOption.BooleanValues(true, true, "1", "Да", "да")
                .TypeConverterOption.BooleanValues(false, true, "0", "Нет", "нет");

            Map(m => m.ВОЗВРАЩЕНО_ОШИБОЧНО)
                .Name("ВОЗВРАЩЕНО_ОШИБОЧНО")
                .TypeConverterOption.BooleanValues(true, true, "1", "Да", "да")
                .TypeConverterOption.BooleanValues(false, true, "0", "Нет", "нет");



        }
    }
}
