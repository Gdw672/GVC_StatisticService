using GVC_StatisticService.Model;

namespace GVC_StatisticService.Service.Interface
{
    public interface ICountReportService
    {
         List<CountReport> GetTestData();
         Task<List<CountReport>> GetCountReports(DateTime date);
    }
}
