using GVC_StatisticService.Enum;
using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Context.Interface
{
    public interface IStatisticDbContext
    {
        public OperationResult WriteReports(List<ReportBase> reports);
    }
}
