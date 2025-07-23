using GVC_StatisticService.Service.Interface;
using System.Net;
using System.Text.Unicode;

namespace GVC_StatisticService.Service
{
    public class FileNameGenerateService : IFileNameGenerateService
    {
        private readonly string filePathCsv = "/app/csvfiles";

        public List<string> CheckFailedFiles(DateTime startDate, DateTime endDate)
        {
            var ranges = GetRange(startDate, endDate);
            var names = GetNames(ranges);

            return names;
        }

        private List<DateTime> GetRange(DateTime startDate, DateTime endDate) 
        {
            List<DateTime> ranges = new List<DateTime>();
            for (DateTime start = startDate; start <= endDate; start = start.AddDays(1))
            {
                ranges.Add(start);
            }

            return ranges;
        }

        private List<string> GetNames(List<DateTime> ranges)
        {
            List<string> names = new List<string>();
            foreach (DateTime date in ranges) {

                var name = $"{date:dd.MM.yyyy}.csv";
                names.Add(name);
            }

            return names;
        }

    }
}
