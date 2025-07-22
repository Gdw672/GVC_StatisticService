using GVC_StatisticService.Enum;
using GVC_StatisticService.Service.Interface;

namespace GVC_StatisticService.Service
{
    public class DeleteCsvService : IDeleteCsvService
    {
        private readonly string filePathCsv = "/csv";

        public string TryDeleteFile(string name)
        {
            FileInfo fileInfo = new FileInfo(Path.Combine(filePathCsv, name));
            if (fileInfo.Exists == false)
            {
                return name;
            }
            else if (fileInfo.Exists && fileInfo.Length < 1000 * 1024)
            {
                try
                {
                    File.Delete(Path.Combine(filePathCsv, name));
                    return name;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ошибка удаления файла {name}: {ex.Message}");
                    return String.Empty;
                }
            }
           
            return String.Empty;
        }
    }
}
