using GVC_StatisticService.Service.Interface;
using System.Globalization;

namespace GVC_StatisticService.Service
{
    public class RedownloadFileService : IRedownloadFileService
    {
        private readonly IFileNameGenerateService fileNameGenerateService;
        private readonly IDeleteCsvService deleteCsvService;
        private readonly IPythonRunnerService pythonRunnerService;
        public RedownloadFileService(IFileNameGenerateService fileNameGenerateService, IDeleteCsvService deleteCsvService, IPythonRunnerService pythonRunnerService)
        {
            this.fileNameGenerateService = fileNameGenerateService;
            this.deleteCsvService = deleteCsvService;
            this.pythonRunnerService = pythonRunnerService;
        }
        public async Task<List<string>> RedownloadReportsByDateAsync(DateTime startDate, DateTime endDate)
        {
            //ToDo: переимновать файл
            var namesToDelete = fileNameGenerateService.CheckFailedFiles(startDate, endDate);
            var deletedFileNames = new List<string>();

            foreach (var file in namesToDelete)
            {
               var answer = deleteCsvService.TryDeleteFile(file);
                if (answer != string.Empty) {
                    deletedFileNames.Add(answer);
                }
            }

            var datesToDownload = ParseDates(deletedFileNames);

            foreach (var date in datesToDownload) {
                await pythonRunnerService.RunDownloadReportForConcreteDate(date);
            }

            return deletedFileNames;
        }

        private List<DateTime> ParseDates(List<string> names)
        {
            var dates = new List<DateTime>();

            foreach (var name in names) {
                string datePart = Path.GetFileNameWithoutExtension(name);

                DateTime date = DateTime.ParseExact(datePart, "dd.MM.yyyy", CultureInfo.InvariantCulture);
                dates.Add(date);
            }

            return dates;
        }
    }
}
