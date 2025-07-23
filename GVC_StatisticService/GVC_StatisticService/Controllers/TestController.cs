using GVC_StatisticService.Service.Interface;
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
        public TestController(IReportDbService reportDbService, IReadCsvService readCsvService) {
        
           this.reportDbService = reportDbService;
            this.readCsvService = readCsvService;
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
    }
}
