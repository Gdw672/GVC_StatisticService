using GVC_StatisticService.Enum;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReportDbService
    {
        public Task<OperationResult> WriteReports();
    }
}
