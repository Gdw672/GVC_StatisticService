using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Model;
using GVC_StatisticService.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GVC_StatisticService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        //ToDo: потом убрать отсюда readCsvService
        private readonly IReadCsvService readCsvService;
        private readonly IReportDbService reportDbService;
        private readonly ICountReportService countReportService;
        private readonly ITxtReadService txtReadService;
        private readonly IPythonRunnerService pythonRunnerService;
        private readonly IFileNameGenerateService checkFilesService;
        private readonly IRedownloadFileService redownloadFileService;

        private readonly IStatisticDbContext statisticDbContext;
        public DatabaseController(IReadCsvService readCsvService,
            IReportDbService reportDbService,
            ICountReportService countReportService,
            ITxtReadService txtReadService,
            IStatisticDbContext statisticDbContext,
            IPythonRunnerService pythonRunnerService,
            IFileNameGenerateService checkFilesService,
            IRedownloadFileService redownloadFileService
            ) 
        { 
            this.readCsvService = readCsvService;
            this.reportDbService = reportDbService;
            this.countReportService = countReportService;
            this.txtReadService = txtReadService;
            this.statisticDbContext = statisticDbContext;
            this.pythonRunnerService = pythonRunnerService;
            this.checkFilesService = checkFilesService;
            this.redownloadFileService = redownloadFileService;
        }

        [HttpPost]
        [Route("downloadReportByDate")]
        public async Task<IActionResult> RunDownloadReportForConcreteDate(DateTime dateTime)
        {
          return Ok(await pythonRunnerService.RunDownloadReportForConcreteDate(dateTime));
        }

        [HttpPost]
        [Route("writeScoTypesAndServices")]
        public IActionResult writeSco()
        {
            txtReadService.WriteScoToDb();
            return Ok("Ok");
        }

        [HttpGet]
        [Route("getReportsByRange")]
        public async Task<IActionResult> GetDataByRange(DateTime startDate, DateTime endDate)
        {
            startDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc).ToUniversalTime();
            endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc).ToUniversalTime();

            return Ok(await statisticDbContext.GetReportsByRange(startDate, endDate));
        }

        [HttpGet]
        [Route("redownloadReportsByDate")]
        public async Task<IActionResult> RedownloadReportsByDate(DateTime startDate, DateTime endDate)
        {
           return Ok(await redownloadFileService.RedownloadReportsByDateAsync(startDate, endDate)); 
        }
    }
}
