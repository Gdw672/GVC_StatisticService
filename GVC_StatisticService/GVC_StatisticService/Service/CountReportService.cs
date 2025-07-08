using GVC_StatisticService.Model;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Service.Interface;

namespace GVC_StatisticService.Service
{
    public class CountReportService : ICountReportService
    {
        public List<CountReport> GetCountReports(List<Report> reports)
        {
            return null;
        }

        public List<CountReport> GetTestData()
        {
            var countList = new List<CountReport>();

            var countReport1 = new CountReport(1, 462, 288.92, 137.92, 151, 118, 107.1, 344, 181.82, 277, new DateTime(2025, 6, 2));
            var countReport2 = new CountReport(2, 483, 270.84, 105.84, 165, 97, 78.02, 386, 192.82, 254, new DateTime(2025, 6, 3));
            var countReport3 = new CountReport(3, 613.62, 450.92, 272.92, 178, 248, 241.1, 365.62, 209.82, 446, new DateTime(2025, 6, 4));

            countList.Add(countReport1);
            countList.Add(countReport2);
            countList.Add(countReport3);


            return countList;
        }
    }
}
