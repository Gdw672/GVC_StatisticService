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
        public DatabaseController(IReadCsvService readCsvService, IReportDbService reportDbService) 
        { 
            this.readCsvService = readCsvService;
            this.reportDbService = reportDbService;
        }

        [HttpPut]
        [Route("WriteFromFile")]
        public OkObjectResult WriteFromFile()
        {
            return Ok(reportDbService.WriteReports());
        }

        [HttpGet]
        [Route("parseCsv")]
        public OkObjectResult Get() {

            return Ok(readCsvService.ReadCsv());
        }
    }
}
