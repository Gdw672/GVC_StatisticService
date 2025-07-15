using GVC_StatisticService.Context;
using GVC_StatisticService.Context.Interface;
using GVC_StatisticService.Service;
using GVC_StatisticService.Service.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<StatisticDbContext>(options =>
    options.UseNpgsql("Host=localhost;Port=5433;Username=postgres;Password=example;Database=statistic"));

builder.Services.AddScoped<IStatisticDbContext>(provider =>
    provider.GetRequiredService<StatisticDbContext>());

builder.Services.AddScoped<IReadCsvService, ReadCsvService>();
builder.Services.AddScoped<IReportDbService, ReportDbService>();
builder.Services.AddScoped<ICountReportService, CountReportService>();
builder.Services.AddScoped<ITxtReadService, TxtReadService>();


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
