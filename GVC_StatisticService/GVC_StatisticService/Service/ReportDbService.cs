using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Enum;
using GVC_StatisticService.Model.Report;
using GVC_StatisticService.Service.Interface;
using System.Runtime.InteropServices;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace GVC_StatisticService.Service
{
    public class ReportDbService : IReportDbService
    {
        private readonly IReadCsvService readCsvService;
        private readonly IStatisticDbContext statisticDbContext;
        private readonly ICountReportService countReportService;

        public ReportDbService(IReadCsvService readCsvService, IStatisticDbContext statisticDbContext, ICountReportService countReportService = null)
        {
            this.readCsvService = readCsvService;
            this.statisticDbContext = statisticDbContext;
            this.countReportService = countReportService;
        }

        public async Task<OperationResult> WriteAndCountReportByYesterday()
        {
            var yesterday = GetYesterdayDate();

            var nameOfFile = $"{yesterday.Day.ToString("D2")}.{yesterday.Month.ToString("D2")}.{yesterday.Year}.csv";
            var reports = ReadFileByName(nameOfFile, yesterday);

            await statisticDbContext.WriteReports(reports);

            var x = await countReportService.GetCountReports(yesterday);

            //ToDo: убрать список, сделать обычный объект CountReport
            statisticDbContext.AddCountReport(x.First());

            return OperationResult.Ok;
        }

        public async Task<OperationResult> WriteAndCountReportByDate(DateTime dateTime)
        {
            var nameOfFile = $"{dateTime.Day.ToString("D2")}.{dateTime.Month.ToString("D2")}.{dateTime.Year}.csv";
            var reports = ReadFileByName(nameOfFile, dateTime);

            await statisticDbContext.WriteReports(reports);

            var x = await countReportService.GetCountReports(dateTime);

            //ToDo: убрать список, сделать обычный объект CountReport
            statisticDbContext.AddCountReport(x.First());

            return OperationResult.Ok;
        }

        private List<ReportBase> ReadFileByName(string nameOfFile, DateTime yesterday)
        {
           return readCsvService.ReadCsvByName(nameOfFile, yesterday);
        }

        public DateTime GetYesterdayDate()
        {
            DateTime utcNow = DateTime.UtcNow;

            string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                ? "Russian Standard Time"
                : "Europe/Moscow";

            TimeZoneInfo moscowTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            DateTime moscowDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, moscowTimeZone);

            DateTime moscowDateOnly = moscowDateTime.Date;

            return moscowDateOnly.AddDays(-1);
        }
    }
}
