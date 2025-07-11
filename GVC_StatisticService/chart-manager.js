// chart-manager.js - Модуль для управления графиками
const ChartManager = {
  config: null,
  plotlyLoaded: false,

  init(config) {
    this.config = config;
    this.loadPlotly();
  },

  async loadPlotly() {
    try {
      // Проверяем, не загружен ли уже Plotly
      if (typeof Plotly !== 'undefined') {
        this.plotlyLoaded = true;
        return;
      }

      // Загружаем Plotly.js
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.26.0/plotly.min.js';
      script.onload = () => {
        this.plotlyLoaded = true;
        console.log('Plotly загружен');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Ошибка загрузки Plotly:', error);
    }
  },

  // Обработчики событий от TableManager
  onParamsChanged() {
    console.log('Параметры изменились:', TableManager.getSelectedParams());
    this.renderCharts();
  },

  onDatesChanged() {
    console.log('Даты изменились:', TableManager.getSelectedDates());
    this.renderCharts();
  },

  onActiveListChanged() {
    console.log('Активный список изменился:', window.AppState.activeListIndex);
    this.renderCharts();
  },

  renderCharts() {
    if (!this.plotlyLoaded) {
      console.log('Plotly ещё не загружен');
      return;
    }

    const selectedParams = TableManager.getSelectedParams();
    const selectedDates = TableManager.getSelectedDates();
    const rawData = TableManager.getRawData();

    if (selectedParams.length === 0 || selectedDates.length === 0) {
      console.log('Нет выбранных параметров или дат для отображения');
      return;
    }

    console.log('Рендеринг графиков:', { selectedParams, selectedDates });
    
    // Здесь будет логика создания графиков
    // Пока что просто логируем данные
    this.prepareChartData(rawData, selectedParams, selectedDates);
  },

  prepareChartData(rawData, selectedParams, selectedDates) {
    // Фильтруем данные по выбранным датам
    const filteredData = rawData.filter(entry => {
      const entryDate = new Date(entry.дата_отчета);
      return selectedDates.some(selectedDate => {
        const selected = new Date(selectedDate);
        return entryDate.getTime() === selected.getTime();
      });
    });

    // Сортируем по дате
    filteredData.sort((a, b) => new Date(a.дата_отчета) - new Date(b.дата_отчета));

    // Подготавливаем данные для каждого параметра
    const chartData = selectedParams.map(param => {
      const values = filteredData.map(entry => entry[param]);
      const dates = filteredData.map(entry => new Date(entry.дата_отчета).toLocaleDateString("ru-RU"));
      
      return {
        parameter: param,
        values: values,
        dates: dates,
        type: this.getParameterType(param)
      };
    });

    console.log('Подготовленные данные для графиков:', chartData);
    
    // Здесь будет вызов создания графика
    // this.createPlotlyChart(chartData);
  },

  getParameterType(param) {
    // Определяем тип параметра для правильного масштабирования
    if (param.startsWith("процент_")) {
      return 'percentage';
    }
    return 'absolute';
  },

  createPlotlyChart(chartData) {
    // Будет реализовано позже
    // Создание графика с помощью Plotly
    console.log('Создание графика Plotly (пока не реализовано)');
  }
};