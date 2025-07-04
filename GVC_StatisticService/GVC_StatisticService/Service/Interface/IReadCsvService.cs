using GVC_StatisticService.Model;

namespace GVC_StatisticService.Service.Interface
{
    public interface IReadCsvService
    {
        public List<Report> ReadCsv();
    }
}
