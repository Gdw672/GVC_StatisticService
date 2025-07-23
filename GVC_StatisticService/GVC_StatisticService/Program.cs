using GVC_StatisticService.Context;
using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Service;
using GVC_StatisticService.Service.Interface;
using Microsoft.EntityFrameworkCore;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Dashboard;
using GVC_StatisticService.Service.Interface.Test;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IPythonRunnerService, PythonRunnerService>();

builder.Services.AddDbContext<StatisticDbContext>(options =>
    options.UseNpgsql("Host=db;Port=5432;Username=postgres;Password=example;Database=statistic"));

builder.Services.AddScoped<IStatisticDbContext>(provider =>
    provider.GetRequiredService<StatisticDbContext>());

builder.Services.AddScoped<IReadCsvService, ReadCsvService>();
builder.Services.AddScoped<IReadCsvServiceTest, ReadCsvService>();
builder.Services.AddScoped<IReportDbService, ReportDbService>();
builder.Services.AddScoped<ICountReportService, CountReportService>();
builder.Services.AddScoped<ITxtReadService, TxtReadService>();
builder.Services.AddScoped<IFileNameGenerateService, FileNameGenerateService>();
builder.Services.AddScoped<IDeleteCsvService, DeleteCsvService>();
builder.Services.AddScoped<IRedownloadFileService, RedownloadFileService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(builder.Configuration.GetConnectionString("HangfireConnection")));

builder.Services.AddHangfireServer();

var app = builder.Build();

    app.UseSwagger();
    app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.UseStaticFiles();



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
    service => service.RunDailyDownloadReport(),
    cronSchedule,
    new RecurringJobOptions
    {
        MisfireHandling = MisfireHandlingMode.Ignorable
    });

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<StatisticDbContext>();
    dbContext.Database.Migrate();
}

app.Run();

// Фильтр авторизации
public class DashboardNoAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
