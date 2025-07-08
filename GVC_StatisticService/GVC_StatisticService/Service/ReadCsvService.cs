using GVC_StatisticService.Service.Interface;
using CsvHelper;
using CsvHelper.Configuration;
using System.ComponentModel;
using System.Globalization;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Model.Report.ClassMap;

namespace GVC_StatisticService.Service
{
    public class ReadCsvService : IReadCsvService
    {
        private string pathToCsv = "C:\\Practice\\Csv\\declarate.csv";

        //ToDo: сделать парсинг типов данных (пока что все string).
        public List<ReportBase> ReadCsv()
        {
            using var reader = new StreamReader(pathToCsv);
            using var csvReader = new CsvReader(reader, CultureInfo.InvariantCulture);

            csvReader.Context.RegisterClassMap<ReportBaseMap>();

            var records = csvReader.GetRecords<ReportBase>().ToList();

            foreach (var record in records)
            {
                if(record.Вр__создания_обращения.HasValue)
                {
                    record.Вр__создания_обращения = DateTime.SpecifyKind(record.Вр__создания_обращения.Value, DateTimeKind.Utc);
                }
                if (record.Вр__создания_обращения_с_учетом_ЗО_инициатора.HasValue)
                {
                    record.Вр__создания_обращения_с_учетом_ЗО_инициатора = DateTime.SpecifyKind(record.Вр__создания_обращения_с_учетом_ЗО_инициатора.Value, DateTimeKind.Utc);
                }
                if (record.ВРЕМЯ_ЗАКРЫТИЯ.HasValue)
                {
                    record.ВРЕМЯ_ЗАКРЫТИЯ = DateTime.SpecifyKind(record.ВРЕМЯ_ЗАКРЫТИЯ.Value, DateTimeKind.Utc);
                }
            }
            return records;
        }
    }
}
