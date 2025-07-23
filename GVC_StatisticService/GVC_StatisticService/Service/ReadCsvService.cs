using GVC_StatisticService.Service.Interface;
using CsvHelper;
using CsvHelper.Configuration;
using System.ComponentModel;
using System.Globalization;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Model.Report.ClassMap;
using System.Net.WebSockets;
using GVC_StatisticService.Service.Interface.Test;

namespace GVC_StatisticService.Service
{
    public class ReadCsvService : IReadCsvService, IReadCsvServiceTest
    {
        private readonly string filePathCsv = "/app/csvfiles";

        private readonly string filePathCsvNotDocker = @"C:\Users\van_d\GVC_StatisticService\GVC_StatisticService\GVC_StatisticService\CsvFiles";

        public List<ReportBase> ReadCsvByName(string fileName, DateTime yesterday)
        {
            var fullPath = Path.Combine(filePathCsv, fileName);

            var cleanedReader = SkipToHeader(fullPath, "Обращение,");

            using var csvReader = new CsvReader(cleanedReader, CultureInfo.InvariantCulture);
            csvReader.Context.RegisterClassMap<ReportBaseMap>();

            var records = csvReader.GetRecords<ReportBase>().ToList();

            foreach (var record in records)
            {
                if (record.Вр__создания_обращения.HasValue)
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
                record.дата_отчета = DateTime.SpecifyKind(yesterday, DateTimeKind.Utc);
            }

            return records;
        }

        public List<ReportBase> ReadCsvByName(DateTime dateTime)
        {
            var fileName = $"{dateTime:dd.MM.yyyy}.csv";
            var fullPath = Path.Combine(filePathCsv, fileName);

            var cleanedReader = SkipToHeader(fullPath, "Обращение,");

            using var csvReader = new CsvReader(cleanedReader, CultureInfo.InvariantCulture);
            csvReader.Context.RegisterClassMap<ReportBaseMap>();

            var records = csvReader.GetRecords<ReportBase>().ToList();

            foreach (var record in records)
            {
                if (record.Вр__создания_обращения.HasValue)
                    record.Вр__создания_обращения = DateTime.SpecifyKind(record.Вр__создания_обращения.Value, DateTimeKind.Utc);

                if (record.Вр__создания_обращения_с_учетом_ЗО_инициатора.HasValue)
                    record.Вр__создания_обращения_с_учетом_ЗО_инициатора = DateTime.SpecifyKind(record.Вр__создания_обращения_с_учетом_ЗО_инициатора.Value, DateTimeKind.Utc);

                if (record.ВРЕМЯ_ЗАКРЫТИЯ.HasValue)
                    record.ВРЕМЯ_ЗАКРЫТИЯ = DateTime.SpecifyKind(record.ВРЕМЯ_ЗАКРЫТИЯ.Value, DateTimeKind.Utc);

                record.дата_отчета = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
            }

            return records;
        }

        public List<ReportBase> ReadCsvByNameTest(string fileName, DateTime yesterday)
        {
            var fullPath = Path.Combine(filePathCsvNotDocker, fileName);

            var cleanedReader = SkipToHeader(fullPath, "Обращение,");

            using var csvReader = new CsvReader(cleanedReader, CultureInfo.InvariantCulture);
            csvReader.Context.RegisterClassMap<ReportBaseMap>();

            var records = csvReader.GetRecords<ReportBase>().ToList();

            foreach (var record in records)
            {
                if (record.Вр__создания_обращения.HasValue)
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
                record.дата_отчета = DateTime.SpecifyKind(yesterday, DateTimeKind.Utc);
            }

            return records;
        }

        public List<ReportBase> ReadCsvByNameTest(DateTime dateTime)
        {
            var fileName = $"{dateTime:dd.MM.yyyy}.csv";
            var fullPath = Path.Combine(filePathCsvNotDocker, fileName);

            var cleanedReader = SkipToHeader(fullPath, "Обращение,");

            using var csvReader = new CsvReader(cleanedReader, CultureInfo.InvariantCulture);
            csvReader.Context.RegisterClassMap<ReportBaseMap>();

            var records = csvReader.GetRecords<ReportBase>().ToList();

            foreach (var record in records)
            {
                if (record.Вр__создания_обращения.HasValue)
                    record.Вр__создания_обращения = DateTime.SpecifyKind(record.Вр__создания_обращения.Value, DateTimeKind.Utc);

                if (record.Вр__создания_обращения_с_учетом_ЗО_инициатора.HasValue)
                    record.Вр__создания_обращения_с_учетом_ЗО_инициатора = DateTime.SpecifyKind(record.Вр__создания_обращения_с_учетом_ЗО_инициатора.Value, DateTimeKind.Utc);

                if (record.ВРЕМЯ_ЗАКРЫТИЯ.HasValue)
                    record.ВРЕМЯ_ЗАКРЫТИЯ = DateTime.SpecifyKind(record.ВРЕМЯ_ЗАКРЫТИЯ.Value, DateTimeKind.Utc);

                record.дата_отчета = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
            }

            return records;
        }


        private StringReader SkipToHeader(string filePath, string headerStart)
        {
            using var reader = new StreamReader(filePath);
            string? line;
            var lines = new List<string>();

            while ((line = reader.ReadLine()) != null)
            {
                if (line.StartsWith(headerStart))
                {
                    lines.Add(line);
                    break;
                }
            }

            while ((line = reader.ReadLine()) != null)
            {
                lines.Add(line);
            }

            return new StringReader(string.Join(Environment.NewLine, lines));
        }

    }
}
