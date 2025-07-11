const ChartManager = {
  config: null,
  plotlyLoaded: false,

  init(config) {
    this.config = config;
    this.loadPlotly();
  },

  async loadPlotly() {
    try {
      if (typeof Plotly !== 'undefined') {
        this.plotlyLoaded = true;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.26.0/plotly.min.js';
      script.onload = () => {
        this.plotlyLoaded = true;
        console.log('Plotly загружен');
      };
      script.onerror = () => console.error('Ошибка загрузки Plotly');
      document.head.appendChild(script);
    } catch (error) {
      console.error('Ошибка загрузки Plotly:', error);
    }
  },

  onParamsChanged() {
    window.AppState.chartsVisible.forEach((visible, index) => {
      if (visible) {
        this.renderChart(index);
      }
    });
  },

  onDatesChanged() {
    window.AppState.chartsVisible.forEach((visible, index) => {
      if (visible) {
        this.renderChart(index);
      }
    });
  },

  onActiveListChanged() {
    console.log('Активный список изменился:', window.AppState.activeListIndex);
  },

  renderChart(chartIndex) {
    if (!this.plotlyLoaded) {
      console.log('Plotly ещё не загружен');
      setTimeout(() => this.renderChart(chartIndex), 100);
      return;
    }

    const selectedParams = window.AppState.selectedParamsByList[chartIndex];
    const selectedDates = window.AppState.selectedDates;
    const rawData = TableManager.getRawData();

    if (selectedParams.length === 0) {
      console.log('Нет выбранных параметров для графика', chartIndex + 1);
      return;
    }

    if (selectedDates.length === 0) {
      console.log('Нет выбранных дат для графика', chartIndex + 1);
      return;
    }

    const chartData = this.prepareChartData(rawData, selectedParams, selectedDates);
    this.createChartContainer(chartIndex);
    this.createPlotlyChart(chartIndex, chartData);
  },

  prepareChartData(rawData, selectedParams, selectedDates) {
    const filteredData = rawData.filter(entry => {
      const entryDate = new Date(entry.дата_отчета);
      return selectedDates.some(selectedDate => {
        const selected = new Date(selectedDate);
        return entryDate.getTime() === selected.getTime();
      });
    });

    filteredData.sort((a, b) => new Date(a.дата_отчета) - new Date(b.дата_отчета));

    const chartData = selectedParams.map(param => {
      const values = filteredData.map(entry => {
        let value = entry[param];
        if (param.startsWith("процент_") && typeof value === 'number') {
          value = value * 100;
        }
        return value;
      });
      
      const dates = filteredData.map(entry => 
        new Date(entry.дата_отчета).toLocaleDateString("ru-RU")
      );
      
      return {
        parameter: param,
        values: values,
        dates: dates,
        type: this.getParameterType(param)
      };
    });

    return chartData;
  },

  getParameterType(param) {
    if (param.startsWith("процент_")) {
      return 'percentage';
    }
    return 'absolute';
  },

  createChartContainer(chartIndex) {
    const chartsContainer = document.getElementById(this.config.chartsContainer);
    const chartId = `chart_${chartIndex}`;
    
    let chartContainer = document.getElementById(chartId);
    if (!chartContainer) {
      chartContainer = document.createElement('div');
      chartContainer.id = chartId;
      chartContainer.className = 'chartContainer';
      
      const header = document.createElement('div');
      header.className = 'chartHeader';
      
      const title = document.createElement('div');
      title.className = 'chartTitle';
      title.innerText = `График ${chartIndex + 1}`;
      
      const closeButton = document.createElement('button');
      closeButton.className = 'closeChartButton';
      closeButton.innerText = '✕';
      closeButton.addEventListener('click', () => {
        this.closeChart(chartIndex);
      });
      
      header.appendChild(title);
      header.appendChild(closeButton);
      chartContainer.appendChild(header);
      
      const plotContainer = document.createElement('div');
      plotContainer.id = `plot_${chartIndex}`;
      plotContainer.className = 'chartPlot';
      chartContainer.appendChild(plotContainer);
      
      chartsContainer.appendChild(chartContainer);
    }
  },

  createPlotlyChart(chartIndex, chartData) {
    const plotId = `plot_${chartIndex}`;
    
    const percentageData = chartData.filter(item => item.type === 'percentage');
    const absoluteData = chartData.filter(item => item.type === 'absolute');
    
    const traces = [];
    const colors = ['#007acc', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    let colorIndex = 0;
    
    percentageData.forEach(item => {
      traces.push({
        x: item.dates,
        y: item.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: item.parameter,
        line: { color: colors[colorIndex % colors.length], width: 2 },
        marker: { size: 6 },
        yaxis: 'y'
      });
      colorIndex++;
    });
    
    absoluteData.forEach(item => {
      traces.push({
        x: item.dates,
        y: item.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: item.parameter,
        line: { color: colors[colorIndex % colors.length], width: 2 },
        marker: { size: 6 },
        yaxis: 'y2'
      });
      colorIndex++;
    });
    
    const layout = {
      title: {
        text: `График ${chartIndex + 1}`,
        font: { size: 16 }
      },
      xaxis: {
        title: 'Дата',
        gridcolor: '#e0e0e0'
      },
      yaxis: {
        title: percentageData.length > 0 ? 'Проценты (%)' : '',
        side: 'left',
        gridcolor: '#e0e0e0',
        showgrid: true
      },
      yaxis2: {
        title: absoluteData.length > 0 ? 'Абсолютные значения' : '',
        side: 'right',
        overlaying: 'y',
        showgrid: false
      },
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h'
      },
      margin: { l: 60, r: 60, t: 60, b: 60 },
      showlegend: true,
      hovermode: 'x unified'
    };
    
    if (percentageData.length === 0) {
      layout.yaxis.title = 'Значения';
      delete layout.yaxis2;
      traces.forEach(trace => {
        trace.yaxis = 'y';
      });
    } else if (absoluteData.length === 0) {
      delete layout.yaxis2;
    }
    
    const config = {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      responsive: true
    };
    
    Plotly.newPlot(plotId, traces, layout, config);
  },

  closeChart(chartIndex) {
    const chartId = `chart_${chartIndex}`;
    const chartContainer = document.getElementById(chartId);
    if (chartContainer) {
      chartContainer.remove();
    }
    
    window.AppState.chartsVisible[chartIndex] = false;
    if (window.TableManager) {
      window.TableManager.renderLists();
    }
  }
};