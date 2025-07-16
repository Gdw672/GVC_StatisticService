using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Model;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Service.Interface;

namespace GVC_StatisticService.Service
{
    public class CountReportService : ICountReportService
    {
        private readonly IStatisticDbContext statisticDbContext;

        public CountReportService(IStatisticDbContext statisticDbContext)
        {
            this.statisticDbContext = statisticDbContext;
        }

        public async Task<List<CountReport>> GetCountReports(DateTime date)
        {
            var reports = await statisticDbContext.GetReportsByDate(date);

            var scoServices = statisticDbContext.GetSCO_services().ToList();
            var scoTypes = statisticDbContext.GetSCO_types().ToList();

            var filteredReports = reports
                .Where(r => r.Рабочая_группа == null || !r.Рабочая_группа.Contains("УДХ"))
                .ToList();

            var strList = filteredReports
                .Where(r => scoServices.Contains(r.Услуга) || scoTypes.Contains(r.Шаблон_запроса))
                .Select(r => r.Обращение)
                .ToHashSet();

            //ToDo: проверить корректность
            var filteredReports2 = filteredReports
                .Where(r => strList.Contains(r.Обращение))
                .ToList();

            double входной_поток_всего = filteredReports2.Sum(r => r.Доля) ?? 0;
            double цифровые_сервисы_всего = filteredReports2
                .Where(r => r.РПА == "RPA" || r.РПА == "ЧБ" || r.РПА == "ЧБП")
                .Sum(r => r.Доля) ?? 0;

            double роботы = filteredReports2
                .Where(r => r.РПА == "RPA")
                .Sum(r => r.Доля) ?? 0;

            double чат_боты = filteredReports2
                .Where(r => r.РПА == "ЧБ" || r.РПА == "ЧБП")
                .Sum(r => r.Доля) ?? 0;

            var filteredAZ = filteredReports2.Where(r => r.АСОЗ == "да");
            double входной_поток_АС_ОЗ = filteredAZ.Sum(r => r.Доля) ?? 0;
            double цифровые_сервисы_АС_ОЗ = filteredAZ
                .Where(r => r.РПА == "RPA" || r.РПА == "ЧБ" || r.РПА == "ЧБП")
                .Sum(r => r.Доля) ?? 0;

            var withoutAZ = filteredReports2.Where(r => string.IsNullOrEmpty(r.АСОЗ));
            double входной_поток_не_АС_ОЗ = withoutAZ.Sum(r => r.Доля) ?? 0;
            double цифровые_сервисы_не_АС_ОЗ = withoutAZ
                .Where(r => r.РПА == "RPA" || r.РПА == "ЧБ" || r.РПА == "ЧБП")
                .Sum(r => r.Доля) ?? 0;

            double самостоятельность = filteredReports2
                .Where(r => r.Доля == 1 && (r.РПА == "RPA" || r.РПА == "ЧБ" || r.РПА == "ЧБП"))
                .Sum(r => r.Доля) ?? 0;

            var count = new CountReport(
                входной_поток_всего,
                цифровые_сервисы_всего,
                роботы,
                чат_боты,
                входной_поток_АС_ОЗ,
                цифровые_сервисы_АС_ОЗ,
                входной_поток_не_АС_ОЗ,
                цифровые_сервисы_не_АС_ОЗ,
                самостоятельность,
                date);

            statisticDbContext.AddCountReport(count);

            return new List<CountReport> { count };
        }
        public List<CountReport> GetTestData()
        {
            var countList = new List<CountReport>();

            var countReport1 = new CountReport(1, 462, 288.92, 137.92, 151, 118, 107.1, 344, 181.82, 277, new DateTime(2025, 6, 2));
            var countReport2 = new CountReport(2, 483, 270.84, 105.84, 165, 97, 78.02, 386, 192.82, 254, new DateTime(2025, 6, 3));
            var countReport3 = new CountReport(3, 613.62, 450.92, 272.92, 178, 248, 241.1, 365.62, 209.82, 446, new DateTime(2025, 6, 4));

            countList.Add(countReport1);
            countList.Add(countReport2);
            countList.Add(countReport3);


            return countList;
        }
    }
}
