using GVC_StatisticService.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GVC_StatisticService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private readonly IReadCsvService readCsvService;
        public DatabaseController(IReadCsvService readCsvService) 
        { 
            this.readCsvService = readCsvService;
        }

        [HttpGet]
        [Route("parseCsv")]
        public OkObjectResult Get() {

            return Ok(readCsvService.ReadCsv());
        }
    }
}
