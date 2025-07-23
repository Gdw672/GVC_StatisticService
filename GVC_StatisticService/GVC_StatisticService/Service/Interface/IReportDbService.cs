using GVC_StatisticService.Enum;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReportDbService
    {
         Task<OperationResult> WriteAndCountReportByYesterday();
         DateTime GetYesterdayDate();
         Task<OperationResult> WriteAndCountReportByDate(DateTime dateTime);
    }
}
