using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;
using GVC_StatisticService.Service.Interface;
using GVC_StatisticService.Enum;

namespace GVC_StatisticService.Service
{
    public class PythonRunnerService : IPythonRunnerService
    {
        private readonly ILogger<PythonRunnerService> _logger;
        private readonly IHostEnvironment _env;
        private readonly IConfiguration _config;
        private readonly IReportDbService reportDbService;

        public PythonRunnerService(
            ILogger<PythonRunnerService> logger,
            IHostEnvironment env,
            IConfiguration config,
            IReportDbService reportDbService)

        {
            _logger = logger;
            _env = env;
            _config = config;
            this.reportDbService = reportDbService;
        }

        public async Task<OperationResult> RunDailyDownloadReport()
        {
            var yesterday = reportDbService.GetYesterdayDate();

            await RunScriptAsync(yesterday, 1);

            return await reportDbService.WriteAndCountReportByYesterday();
        }

        public async Task<OperationResult> RunDownloadReportForConcreteDate(DateTime dateTime)
        {
            await RunScriptAsync(dateTime, 1);

            return await reportDbService.WriteAndCountReportByDate(dateTime);
        }
        public async Task<OperationResult> RunDownloadReportForConcreteDate(DateTime dateTime, int days)
        {
            await RunScriptAsync(dateTime, days);

            return await reportDbService.WriteAndCountReportByDate(dateTime);
        }

        public async Task<OperationResult> RunScriptAsync(DateTime startDate, int daysCount)
        {
            try
            {
                var scriptPath = _config["Python:ScriptPath"] ?? "Scripts/stub_script.py";

                var arguments = $"{startDate:dd.MM.yyyy} {daysCount}";

                _logger.LogInformation("Запуск Python-скрипта: {Script} с аргументами: {Args}",
                    scriptPath, arguments);

                var output = await RunPythonProcess(scriptPath, arguments);

                _logger.LogInformation("Python-скрипт успешно выполнен. Вывод: {Output}", output);

                return OperationResult.Ok;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка выполнения Python-скрипта");
                return OperationResult.Error;
                throw;
            }
        }

        private async Task<string> RunPythonProcess(string scriptPath, string arguments)
        {
            var processStartInfo = new ProcessStartInfo
            {
                FileName = "python3",
                Arguments = $"\"{scriptPath}\" {arguments}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = new Process { StartInfo = processStartInfo };
            process.Start();

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"Скрипт завершился с ошибкой (код {process.ExitCode}): {error}");

            return output;
        }
    }
}
