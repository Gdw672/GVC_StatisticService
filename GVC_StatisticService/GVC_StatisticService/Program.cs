using GVC_StatisticService.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;

var builder = WebApplication.CreateBuilder(args);

// Сервисы
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Hangfire с PostgreSQL
builder.Services.AddHangfire(config => config
    .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("HangfireConnection")));

builder.Services.AddHangfireServer();

// Регистрация Python сервиса
builder.Services.AddScoped<IPythonRunnerService, PythonRunnerService>();

var app = builder.Build();

// Middleware
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    DashboardTitle = "Background Jobs",
    Authorization = [new DashboardNoAuthorizationFilter()]
});

// Регистрация периодической задачи
var cronSchedule = builder.Configuration["Python:ExecutionCron"];
RecurringJob.AddOrUpdate<IPythonRunnerService>(
    "python-script-job",
    service => service.RunScriptAsync(),
    cronSchedule,
    new RecurringJobOptions
    {
        MisfireHandling = MisfireHandlingMode.Ignorable
    });

app.Run();

// Фильтр авторизации
public class DashboardNoAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
