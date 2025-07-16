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
        public TestController(IReportDbService reportDbService) {
        
           this.reportDbService = reportDbService;

        } 
        [HttpGet]
        [Route("writeAndCountReportByLastDate")]
        public async Task<IActionResult> GetDate()
        {
            return Ok( await reportDbService.WriteAndCountReportByDate());
        }
    }
}
