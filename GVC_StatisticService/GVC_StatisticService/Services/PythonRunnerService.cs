using System.Diagnostics;

namespace GVC_StatisticService.Services
{
    public class PythonRunnerService(
        ILogger<PythonRunnerService> logger,
        IHostEnvironment env,
        IConfiguration config)
        : IPythonRunnerService
    {
        private readonly IHostEnvironment _env = env;

        public async Task RunScriptAsync()
        {
            try
            {
                // Получаем настройки из конфигурации
                var scriptPath = config["Python:ScriptPath"] ?? "Scripts/stub_script.py";
                var arguments = config["Python:Arguments"] ?? "";
                
                logger.LogInformation("Запуск Python-скрипта: {Script} с аргументами: {Args}", 
                    scriptPath, arguments);
                
                var output = await RunPythonProcess(scriptPath, arguments);
                logger.LogInformation("Python-скрипт успешно выполнен. Вывод: {Output}", output);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка выполнения Python-скрипта");
                throw;
            }
        }

        private async Task<string> RunPythonProcess(string scriptPath, string arguments)
        {
            var processStartInfo = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"\"{scriptPath}\" {arguments}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            
            using var process = new Process();
            process.StartInfo = processStartInfo;
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
