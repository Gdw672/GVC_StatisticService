using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReadCsvService
    {
        public List<ReportBase> ReadCsv();
    }
}
