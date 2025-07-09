using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Enum;
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
            List<string> types = new List<string>();
            foreach (var type in SCO_types)
            {
                types.Add(type.Name);
            }
            return types;
        }
        public List<string> GetSCO_services()
        {
            List<string> services = new List<string>();
            foreach (var service in SCO_services)
            {
                services.Add(service.Name);
            }
            return services;
        }

        //ToDo: вытаскиваем инфу Report по дате, считает и записываем отчет за день
        public async Task<List<Report>> GetReportsByDate(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            return await reports.Where(r => r.дата_отчета.HasValue && r.дата_отчета.Value >= startDate && r.дата_отчета.Value < endDate).ToListAsync();
        }
    }
}
