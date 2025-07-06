using Microsoft.EntityFrameworkCore;

namespace GVC_StatisticService.Model.Report
{
    public class Report : ReportBase
    {
        public int Id { get; set; }

        public Report()
        {

        }
        public Report(ReportBase reportBase)
        {
            this.Обращение = reportBase.Обращение;
            this.Вр__создания_обращения = reportBase.Вр__создания_обращения;
            this.Вр__создания_обращения_с_учетом_ЗО_инициатора = reportBase.Вр__создания_обращения_с_учетом_ЗО_инициатора;
            this.ВРЕМЯ_ЗАКРЫТИЯ = reportBase.ВРЕМЯ_ЗАКРЫТИЯ;
            this.IP_адрес = reportBase.IP_адрес;
            this.РПА = reportBase.РПА;
            this.Доля = reportBase.Доля;
            this.ТЗ = reportBase.ТЗ;
            this.Порядок = reportBase.Порядок;
            this.Объект = reportBase.Объект;
            this.Наряд = reportBase.Наряд;
            this.Направление_РГ = reportBase.Направление_РГ;
            this.Рабочая_группа = reportBase.Рабочая_группа;
            this.Исполнитель = reportBase.Исполнитель;
            this.Полигон_инициатора = reportBase.Полигон_инициатора;
            this.ФИО = reportBase.ФИО;
            this.Подразделение_инициатора = reportBase.Подразделение_инициатора;
            this.Способ_обращения = reportBase.Способ_обращения;
            this.Причина_обращения = reportBase.Причина_обращения;
            this.АСОЗ = reportBase.АСОЗ;
            this.ВП = reportBase.ВП;
            this.ОСК = reportBase.ОСК;
            this.Услуга = reportBase.Услуга;
            this.ЭК_запроса_наряда = reportBase.ЭК_запроса_наряда;
            this.Направление_проблем = reportBase.Направление_проблем;
            this.ЭК_робота = reportBase.ЭК_робота;
            this.Код_мероприятия_РРО = reportBase.Код_мероприятия_РРО;
            this.Шаблон_запроса = reportBase.Шаблон_запроса;
            this.ВОЗВРАЩЕНО = reportBase.ВОЗВРАЩЕНО;
            this.ВОЗВРАЩЕНО_ОШИБОЧНО = reportBase.ВОЗВРАЩЕНО_ОШИБОЧНО;
            this.КРАТКОЕ_ОПИСАНИЕ = reportBase.КРАТКОЕ_ОПИСАНИЕ;
            this.ПОДРОБНОЕ_ОПИСАНИЕ = reportBase.ПОДРОБНОЕ_ОПИСАНИЕ;
            this.РЕШЕНИЕ = reportBase.РЕШЕНИЕ;
        }
    }
}
