using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Enum;
using GVC_StatisticService.Migrations;
using GVC_StatisticService.Model;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Model.SCO_service;
using GVC_StatisticService.Model.SCO_types;
using Microsoft.EntityFrameworkCore;

namespace GVC_StatisticService.Context
{
    public class StatisticDbContext : DbContext, IStatisticDbContext
    {
        public StatisticDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Report> reports { get; set; }
        public DbSet<SCO_service> SCO_services { get; set; }
        public DbSet<SCO_type> SCO_types { get; set; }
        public DbSet<CountReport> countReports { get; set; }

        public async Task<OperationResult> WriteReports(List<ReportBase> reports)
        {
            var inputKeys = reports.Select(r => r.Обращение).Distinct().ToList();

            var duplicateKeys = new HashSet<string>(
                await this.reports.Where(r => inputKeys.Contains(r.Обращение)).Select(r => r.Обращение).ToListAsync());

            List<Report> newReportList = new List<Report>();
            foreach (var report in reports)
            {
                if(duplicateKeys.Contains(report.Обращение) == true)
                {
                    continue;
                }
                Report newReport = new Report(report);
                newReportList.Add(newReport);
            }

            this.reports.AddRange(newReportList);

            await base.SaveChangesAsync();

            return OperationResult.Ok;
        }

        public List<string> GetSCO_types()
        {
           return SCO_types.Select(type => type.Name).ToList();
        }
        public List<string> GetSCO_services()
        {
            return SCO_services.Select(type => type.Name).ToList();
        }

        //ToDo: вытаскиваем инфу Report по дате, считает и записываем отчет за день
        public async Task<List<Report>> GetReportsByDate(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            return await reports.Where(r => r.дата_отчета.HasValue && r.дата_отчета.Value >= startDate && r.дата_отчета.Value < endDate).ToListAsync();
        }

        public async Task<List<CountReport>> GetReportsByRange(DateTime startDate, DateTime endDate)
        {
            return await countReports
                .Where(r => r.дата_отчета.HasValue
                         && r.дата_отчета.Value >= startDate
                         && r.дата_отчета.Value <= endDate)
                .ToListAsync();
        }

        public CountReport AddCountReport(CountReport report)
        {
            bool exists = countReports.Any(t => t.дата_отчета == report.дата_отчета);
            if (!exists)
            {
                countReports.Add(report);

                base.SaveChanges();

                return report;
            }
            return null;
        }

        public void AddScoTypesAndServices(List<SCO_type> types, List<SCO_service> services)
        {
            foreach (var type in types)
            {
                bool exists = SCO_types.Any(t => t.Name == type.Name);
                if (!exists)
                {
                    SCO_types.Add(type);
                }
            }

            foreach (var service in services)
            {
                bool exists = SCO_services.Any(s => s.Name == service.Name);
                if (!exists)
                {
                    SCO_services.Add(service);
                }
            }

            base.SaveChanges();
        }


    }
}
