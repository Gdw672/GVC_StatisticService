namespace GVC_StatisticService.Model.Report
{
    public class ReportBase
    {
        public string Обращение { get; set; }
        public DateTime? Вр__создания_обращения { get; set; }
        public DateTime? Вр__создания_обращения_с_учетом_ЗО_инициатора { get; set; }
        public DateTime? ВРЕМЯ_ЗАКРЫТИЯ { get; set; }
        public string IP_адрес { get; set; }
        public string РПА { get; set; }
        public double? Доля { get; set; }
        public double? ТЗ { get; set; }
        public int? Порядок { get; set; }
        public string Объект { get; set; }
        public string Наряд { get; set; }
        public string Направление_РГ { get; set; }
        public string Рабочая_группа { get; set; }
        public string Исполнитель { get; set; }
        public string Полигон_инициатора { get; set; }
        public string ФИО { get; set; }
        public string Подразделение_инициатора { get; set; }
        public string Способ_обращения { get; set; }
        public string Причина_обращения { get; set; }
        public string АСОЗ { get; set; }
        public string ВП { get; set; }
        public string ОСК { get; set; }
        public string Услуга { get; set; }
        public string ЭК_запроса_наряда { get; set; }
        public string Направление_проблем { get; set; }
        public string ЭК_робота { get; set; }
        public string Код_мероприятия_РРО { get; set; }
        public string Шаблон_запроса { get; set; }
        public bool? ВОЗВРАЩЕНО { get; set; }
        public bool? ВОЗВРАЩЕНО_ОШИБОЧНО { get; set; }
        public string КРАТКОЕ_ОПИСАНИЕ { get; set; }
        public string ПОДРОБНОЕ_ОПИСАНИЕ { get; set; }
        public string РЕШЕНИЕ { get; set; }
        public DateTime? дата_отчета { get; set; }
    }
}
