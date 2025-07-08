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
        public DatabaseController(IReadCsvService readCsvService, IReportDbService reportDbService, ICountReportService countReportService) 
        { 
            this.readCsvService = readCsvService;
            this.reportDbService = reportDbService;
            this.countReportService = countReportService;
        }

        [HttpPut]
        [Route("WriteFromFile")]
        public async Task<IActionResult> WriteFromFile()
        {
            return Ok(await reportDbService.WriteReports());
        }

        [HttpGet]
        [Route("parseCsv")]
        public OkObjectResult Get() {

            return Ok(readCsvService.ReadCsv());
        }

        [HttpGet]
        [Route("testData")]
        public IActionResult getTestData()
        {
            return Ok(countReportService.GetTestData());
        }
    }
}
