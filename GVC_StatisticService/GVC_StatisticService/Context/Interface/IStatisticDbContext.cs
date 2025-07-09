using GVC_StatisticService.Enum;
using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Context.Interface
{
    public interface IStatisticDbContext
    {
        public Task<OperationResult> WriteReports(List<ReportBase> reports);
        Task<List<Report>> GetReportsByDate(DateTime date);
        List<string> GetSCO_types();
        List<string> GetSCO_services();
    }
}
