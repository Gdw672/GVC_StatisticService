using System.Data;
using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Model
{
    public class CountReport
    {
        public CountReport() { }
        public CountReport(List<Report.Report> report)
        {
            дата_отчета = report.FirstOrDefault()?.дата_отчета;
        }

        public CountReport(int id, double входной_поток_всего, double цифровые_сервисы_всего, double роботы, double чат_боты, double входной_поток_АС_ОЗ, double цифровые_сервисы_АС_ОЗ, double входной_поток_не_АС_ОЗ, double цифровые_сервисы_не_АС_ОЗ, double самостоятельность, DateTime? дата_отчета)
        {
            Id = id;
            this.входной_поток_всего = входной_поток_всего;
            this.цифровые_сервисы_всего = цифровые_сервисы_всего;
            this.роботы = роботы;
            this.чат_боты = чат_боты;
            this.входной_поток_АС_ОЗ = входной_поток_АС_ОЗ;
            this.цифровые_сервисы_АС_ОЗ = цифровые_сервисы_АС_ОЗ;
            this.входной_поток_не_АС_ОЗ = входной_поток_не_АС_ОЗ;
            this.цифровые_сервисы_не_АС_ОЗ = цифровые_сервисы_не_АС_ОЗ;
            this.самостоятельность = самостоятельность;

            this.процент_цифровых_сервисов = this.цифровые_сервисы_всего/this.входной_поток_всего;
            this.процент_роботов = this.роботы / this.входной_поток_всего;
            this.процент_чат_ботов = this.чат_боты / this.входной_поток_всего;
            this.процент_АС_ОЗ = this.цифровые_сервисы_АС_ОЗ / this.входной_поток_АС_ОЗ;
            this.процент_не_АС_ОЗ = this.цифровые_сервисы_не_АС_ОЗ /this.входной_поток_не_АС_ОЗ;
            this.процент_самостоятельности = this.самостоятельность / this.цифровые_сервисы_всего;
            this.дата_отчета = дата_отчета;
        }

        public int Id { get; set; }
        public double входной_поток_всего {  get; set; }
        public double цифровые_сервисы_всего { get; set; }
        public double роботы { get; set; }
        public double чат_боты { get; set; }
        public double входной_поток_АС_ОЗ { get; set; }
        public double цифровые_сервисы_АС_ОЗ { get; set; }
        public double входной_поток_не_АС_ОЗ { get; set; }
        public double цифровые_сервисы_не_АС_ОЗ { get; set; }
        public double самостоятельность { get; set; }

        public double процент_цифровых_сервисов { get; set; }
        public double процент_роботов {  get; set; }
        public double процент_чат_ботов { get; set; }
        public double процент_АС_ОЗ { get; set; }
        public double процент_не_АС_ОЗ { get; set; }
        public double процент_самостоятельности { get; set; }
        public DateTime? дата_отчета {  get; set; }
    }
}
