using GVC_StatisticService.Service.Interface;
using GVC_StatisticService.Service.Interface.Test;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GVC_StatisticService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IReportDbService reportDbService;
        private readonly IReadCsvService readCsvService;
        private readonly IReadCsvServiceTest readCsvServiceTest;
        public TestController(IReportDbService reportDbService, IReadCsvService readCsvService, IReadCsvServiceTest readCsvServiceTest) {
        
           this.reportDbService = reportDbService;
           this.readCsvService = readCsvService;
           this.readCsvServiceTest = readCsvServiceTest;
        } 
        [HttpGet]
        [Route("writeAndCountReportByLastDate")]
        public async Task<IActionResult> GetDate()
        {
            return Ok( await reportDbService.WriteAndCountReportByYesterday());
        }

        [HttpGet]
        [Route("tryReadCsv")]
        public IActionResult tryReadCsvBYDate(DateTime dateTime)
        {
           return Ok(readCsvService.ReadCsvByName(dateTime).First());
        }

        [HttpGet]
        [Route("readCsvAndCountTest")]
        public async Task<IActionResult> readCsvAndCountTest(DateTime dateTime)
        {
            return Ok(await reportDbService.WriteAndCountReportByDateTest(dateTime));
        }
    }
}
