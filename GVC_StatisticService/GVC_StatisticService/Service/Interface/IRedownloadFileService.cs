namespace GVC_StatisticService.Service.Interface
{
    public interface IRedownloadFileService
    {
        Task<List<string>> RedownloadReportsByDateAsync(DateTime startDate, DateTime endDate);
    }
}