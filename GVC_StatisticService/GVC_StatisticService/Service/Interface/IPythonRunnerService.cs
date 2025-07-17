using GVC_StatisticService.Enum;

namespace GVC_StatisticService.Service.Interface
{
    public interface IPythonRunnerService
    {
        Task<OperationResult> RunScriptAsync(DateTime startDate, int daysCount);
        Task<OperationResult> RunDailyDownloadReport();
        Task<OperationResult> RunDownloadReportForConcreteDate(DateTime dateTime);
    }
}
