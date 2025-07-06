using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Enum;
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
    }
}
