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

        public OperationResult WriteReports(List<ReportBase> reports)
        {
            List<Report> newReportList = new List<Report>();
            foreach (var report in reports)
            {
                Report newReport = new Report(report);
                newReportList.Add(newReport);
            }
            this.reports.AddRange(newReportList);

            base.SaveChanges();

            return OperationResult.Ok;
        }
    }
}
