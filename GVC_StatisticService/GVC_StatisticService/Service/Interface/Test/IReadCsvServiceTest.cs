using GVC_StatisticService.Model.Report;

namespace GVC_StatisticService.Service.Interface.Test
{
    public interface IReadCsvServiceTest
    {
        List<ReportBase> ReadCsvByNameTest(string fileName, DateTime yesterday);
        List<ReportBase> ReadCsvByNameTest(DateTime dateTime);
    }
}
