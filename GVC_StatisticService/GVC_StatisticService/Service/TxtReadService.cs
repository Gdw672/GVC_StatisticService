using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Model.SCO_service;
using GVC_StatisticService.Model.SCO_types;
using GVC_StatisticService.Service.Interface;

namespace GVC_StatisticService.Service
{
    public class TxtReadService : ITxtReadService
    {
        private readonly IStatisticDbContext statisticDbContext;

        private readonly string filePathServices = Path.Combine(AppContext.BaseDirectory, "TxtFiles", "SCO_serv.txt");
        private readonly string filePathTypes = Path.Combine(AppContext.BaseDirectory, "TxtFiles", "SCO_types.txt");

        public TxtReadService (IStatisticDbContext statisticDbContext)
        {
             this.statisticDbContext = statisticDbContext;
        }

        public void WriteScoToDb()
        {
            var types = ConvertScoTypes();
            var services = ConvertScoServices();

            statisticDbContext.AddScoTypesAndServices(types, services);
        }

        private List<SCO_type> ConvertScoTypes()
        {
            List<SCO_type> types = new List<SCO_type>();

            foreach (string line in File.ReadLines(filePathTypes))
            {
                string trimmedLine = line.Trim();
                SCO_type newType = new SCO_type{ Name = trimmedLine};
                types.Add(newType);
            }

            return types;
        }

        private List<SCO_service> ConvertScoServices()
        {
            List<SCO_service> services = new List<SCO_service>();

            foreach (string line in File.ReadLines(filePathServices))
            {
                string trimmedLine = line.Trim();
                SCO_service newService = new SCO_service { Name = trimmedLine };
                services.Add(newService);
            }

            return services;
        }
    }
}
