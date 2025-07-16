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

        private readonly IStatisticDbContext statisticDbContext;
        public DatabaseController(IReadCsvService readCsvService, IReportDbService reportDbService, ICountReportService countReportService, ITxtReadService txtReadService, IStatisticDbContext statisticDbContext) 
        { 
            this.readCsvService = readCsvService;
            this.reportDbService = reportDbService;
            this.countReportService = countReportService;
            this.txtReadService = txtReadService;
            this.statisticDbContext = statisticDbContext;
        }

        //ToDo: сделать метод который записывет файл и сразу делает CountReport; 1. - выкачка отчета. 2 - поиск последнего. 3 - парсинг даты. 4 - запись отчета в бд + счет.
        [HttpPost]
        public void GetCsvAndWriteAndCount()
        {

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
        [Route("tryCountReportBase")]
        public async Task<IActionResult> GetData()
        {

            return Ok(await countReportService.GetCountReports(DateTime.SpecifyKind(new DateTime(2025, 7, 15), DateTimeKind.Utc)));
        }

        [HttpGet]
        [Route("testData")]
        public IActionResult getTestData()
        {
            return Ok(countReportService.GetTestData());
        }
    }
}
