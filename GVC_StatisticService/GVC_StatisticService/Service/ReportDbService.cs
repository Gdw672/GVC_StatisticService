using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Enum;
using GVC_StatisticService.Service.Interface;

namespace GVC_StatisticService.Service
{
    public class ReportDbService : IReportDbService
    {
        private readonly IReadCsvService readCsvService;
        private readonly IStatisticDbContext statisticDbContext;

        public ReportDbService(IReadCsvService readCsvService, IStatisticDbContext statisticDbContext) {
            this.readCsvService = readCsvService;
            this.statisticDbContext = statisticDbContext;
        }

        public async Task<OperationResult> WriteReports()
        {
           var reports = readCsvService.ReadCsv();

           return await statisticDbContext.WriteReports(reports);
        }
    }
}
