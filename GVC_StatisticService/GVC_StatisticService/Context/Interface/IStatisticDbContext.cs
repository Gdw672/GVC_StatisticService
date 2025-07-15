using GVC_StatisticService.Enum;
using GVC_StatisticService.Model;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Model.SCO_service;
using GVC_StatisticService.Model.SCO_types;
using System.Threading.Tasks;

namespace GVC_StatisticService.Context.Interface
{
    public interface IStatisticDbContext
    {
        public Task<OperationResult> WriteReports(List<ReportBase> reports);
        Task<List<Report>> GetReportsByDate(DateTime date);
        List<string> GetSCO_types();
        List<string> GetSCO_services();
        void AddScoTypesAndServices(List<SCO_type> types, List<SCO_service> services);
        Task<List<CountReport>> GetReportsByRange(DateTime startDate, DateTime endDate);
         CountReport AddCountReport(CountReport report);
    }
}
