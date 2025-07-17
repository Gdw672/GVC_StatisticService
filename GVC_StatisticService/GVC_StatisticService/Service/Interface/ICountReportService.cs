using GVC_StatisticService.Model;

namespace GVC_StatisticService.Service.Interface
{
    public interface ICountReportService
    {
         Task<List<CountReport>> GetCountReports(DateTime date);
    }
}
