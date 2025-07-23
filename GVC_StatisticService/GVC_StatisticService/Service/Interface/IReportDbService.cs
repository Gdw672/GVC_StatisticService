using GVC_StatisticService.Enum;
using GVC_StatisticService.Model;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReportDbService
    {
         Task<OperationResult> WriteAndCountReportByYesterday();
         DateTime GetYesterdayDate();
         Task<OperationResult> WriteAndCountReportByDate(DateTime dateTime);
         Task<List<CountReport>> WriteAndCountReportByDateTest(DateTime dateTime);
    }
}
