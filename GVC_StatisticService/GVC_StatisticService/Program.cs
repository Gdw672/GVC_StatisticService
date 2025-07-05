using GVC_StatisticService.Context;
using GVC_StatisticService.Service;
using GVC_StatisticService.Service.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddTransient<IReadCsvService, ReadCsvService>();

builder.Services.AddDbContext<StatisticDbContext>(options =>
    options.UseNpgsql("Host=localhost;Port=5433;Username=postgres;Password=example;Database=statistic"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
