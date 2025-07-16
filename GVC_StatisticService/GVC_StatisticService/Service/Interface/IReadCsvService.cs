using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReadCsvService
    {
        List<ReportBase> ReadCsvByName(string fileName, DateTime yesterday);
    }
}
