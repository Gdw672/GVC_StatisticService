# Базовый образ для runtime (Linux)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
RUN apt-get update && apt-get install -y locales && locale-gen ru_RU.UTF-8
WORKDIR /app
EXPOSE 80

# Образ для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["GVC_StatisticService.csproj", "."]
RUN dotnet restore "./GVC_StatisticService.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "./GVC_StatisticService.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этап публикации
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./GVC_StatisticService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GVC_StatisticService.dll"]
