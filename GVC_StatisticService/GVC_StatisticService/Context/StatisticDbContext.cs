using GVC_StatisticService.Model;
using Microsoft.EntityFrameworkCore;

namespace GVC_StatisticService.Context
{
    public class StatisticDbContext : DbContext
    {
        public StatisticDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<ReportBase> reports { get; set; }
    }
}
