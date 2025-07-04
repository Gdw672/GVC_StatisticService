using GVC_StatisticService.Service.Interface;
using CsvHelper;
using CsvHelper.Configuration;
using System.ComponentModel;
using System.Globalization;
using GVC_StatisticService.Model;

namespace GVC_StatisticService.Service
{
    public class ReadCsvService : IReadCsvService
    {
        private string pathToCsv = "C:\\Practice\\Csv\\declarate.csv";


        //ToDo: сделать парсинг типов данных (пока что все string).
        public List<Report> ReadCsv()
        {
            using var reader = new StreamReader(pathToCsv);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = csv.GetRecords<Report>().ToList();

            return records;
        }
    }
}
