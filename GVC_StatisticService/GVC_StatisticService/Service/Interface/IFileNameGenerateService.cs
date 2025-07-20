namespace GVC_StatisticService.Service.Interface
{
    public interface IFileNameGenerateService
    {
        List<string> CheckFailedFiles(DateTime startDate, DateTime endDate);
    }
}
