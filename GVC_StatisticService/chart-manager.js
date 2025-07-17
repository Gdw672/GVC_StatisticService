const ChartManager = {
  config: null,
  plotlyLoaded: false,

  init(config) {
    this.config = config;
    this.initializeState();
    this.loadPlotly();
  },

  initializeState() {
    window.AppState.chartsVisible = window.AppState.chartsVisible || [];
    window.AppState.chartSettings = window.AppState.chartSettings || [];
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

  showChart(listIndex) {
    while (window.AppState.chartsVisible.length <= listIndex) {
      window.AppState.chartsVisible.push(false);
    }
    
    window.AppState.chartsVisible[listIndex] = true;
    this.renderChart(listIndex);
    window.TableManager.renderLists();
  },

  renderChart(chartIndex) {
    if (!this.plotlyLoaded) {
      console.log('Plotly ещё не загружен');
      setTimeout(() => this.renderChart(chartIndex), 100);
      return;
    }

    const selectedParams = window.AppState.selectedParamsByList[chartIndex];
    const selectedDates = window.AppState.selectedDates;
    const rawData = window.TableManager.getRawData();

    if (selectedParams.length === 0 || selectedDates.length === 0) {
      this.handleEmptySelection(chartIndex);
      return;
    }

    const chartData = this.prepareChartData(rawData, selectedParams, selectedDates);
    this.createChartContainer(chartIndex);
    this.createPlotlyChart(chartIndex, chartData);
  },

  handleEmptySelection(chartIndex) {
    const message = window.AppState.selectedParamsByList[chartIndex].length === 0 
      ? 'Выберите параметры для графика!' 
      : 'Выберите даты для графика!';
    
    console.log(message, chartIndex + 1);
    alert(message);
    window.AppState.chartsVisible[chartIndex] = false;
    window.TableManager.renderLists();
  },

  prepareChartData(rawData, selectedParams, selectedDates) {
    const filteredData = rawData
      .filter(entry => selectedDates.some(d => new Date(entry.дата_отчета).getTime() === new Date(d).getTime()))
      .sort((a, b) => new Date(a.дата_отчета) - new Date(b.дата_отчета));

    return selectedParams.map(param => ({
      parameter: param,
      values: filteredData.map(entry => param.startsWith("процент_") && typeof entry[param] === 'number' 
        ? entry[param] * 100 
        : entry[param]),
      dates: filteredData.map(entry => new Date(entry.дата_отчета).toLocaleDateString("ru-RU")),
      type: this.getParameterType(param)
    }));
  },

  getParameterType(param) {
    return param.startsWith("процент_") ? 'percentage' : 'absolute';
  },

  createChartContainer(chartIndex) {
    const chartsContainer = document.getElementById(this.config.chartsContainer);
    const chartId = `chart_${chartIndex}`;
    
    let chartContainer = document.getElementById(chartId);
    if (chartContainer) return;

    chartContainer = document.createElement('div');
    chartContainer.id = chartId;
    chartContainer.className = 'chartContainer';
    
    chartContainer.appendChild(this.createChartHeader(chartIndex));
    chartContainer.appendChild(this.createSettingsContainer(chartIndex));
    chartContainer.appendChild(this.createPlotContainer(chartIndex));
    
    chartsContainer.appendChild(chartContainer);
  },

  createChartHeader(chartIndex) {
    const header = document.createElement('div');
    header.className = 'chartHeader';
    
    const title = document.createElement('div');
    title.className = 'chartTitle';
    title.innerText = `График ${chartIndex + 1}`;
    
    const toggleSettingsButton = document.createElement('button');
    toggleSettingsButton.className = 'toggleSettings';
    toggleSettingsButton.innerText = 'Настройки';
    toggleSettingsButton.addEventListener('click', () => {
      document.getElementById(`settings_${chartIndex}`).classList.toggle('settings-collapsed');
    });
    
    const closeButton = document.createElement('button');
    closeButton.className = 'closeChartButton';
    closeButton.innerText = '✕';
    closeButton.addEventListener('click', () => this.closeChart(chartIndex));
    
    header.appendChild(title);
    header.appendChild(toggleSettingsButton);
    header.appendChild(closeButton);
    
    return header;
  },

  createSettingsContainer(chartIndex) {
    const settingsContainer = document.createElement('div');
    settingsContainer.id = `settings_${chartIndex}`;
    settingsContainer.className = 'chartSettings settings-collapsed';
    
    settingsContainer.appendChild(this.createSettingsGroup(chartIndex, 'Тип графика:', 'chartType', [
      { value: 'scatter', text: 'Линейный' },
      { value: 'bar', text: 'Столбчатый' },
      { value: 'scattergl', text: 'Точечный' }
    ]));
    
    settingsContainer.appendChild(this.createSettingsGroup(chartIndex, 'Толщина линии:', 'lineWidth', null, 'number', { min: 1, max: 10, value: 2 }));
    
    settingsContainer.appendChild(this.createSettingsGroup(chartIndex, 'Показать маркеры:', 'markers', null, 'checkbox', { checked: true }));
    
    settingsContainer.appendChild(this.createSettingsGroup(chartIndex, 'Масштаб осей:', 'scale', [
      { value: 'linear', text: 'Линейный' },
      { value: 'log', text: 'Логарифмический' }
    ]));
    
    const applyButton = document.createElement('button');
    applyButton.className = 'applySettings';
    applyButton.innerText = 'Применить';
    applyButton.addEventListener('click', () => this.applyChartSettings(chartIndex));
    settingsContainer.appendChild(applyButton);
    
    return settingsContainer;
  },

  createSettingsGroup(chartIndex, labelText, id, options = null, inputType = 'select', attributes = {}) {
    const group = document.createElement('div');
    group.className = 'settingsGroup';
    
    const label = document.createElement('label');
    label.innerText = labelText;
    
    const input = document.createElement(inputType);
    input.id = `${id}_${chartIndex}`;
    
    if (inputType === 'select' && options) {
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.text;
        input.appendChild(option);
      });
    } else if (inputType === 'number') {
      input.type = 'number';
      input.min = attributes.min;
      input.max = attributes.max;
      input.value = attributes.value;
    } else if (inputType === 'checkbox') {
      input.checked = attributes.checked;
    }
    
    group.appendChild(label);
    group.appendChild(input);
    return group;
  },

  createPlotContainer(chartIndex) {
    const plotContainer = document.createElement('div');
    plotContainer.id = `plot_${chartIndex}`;
    plotContainer.className = 'chartPlot';
    return plotContainer;
  },

  applyChartSettings(chartIndex) {
    const settings = {
      chartType: document.getElementById(`chartType_${chartIndex}`).value,
      lineWidth: parseInt(document.getElementById(`lineWidth_${chartIndex}`).value),
      showMarkers: document.getElementById(`markers_${chartIndex}`).checked,
      scaleType: document.getElementById(`scale_${chartIndex}`).value
    };
    
    window.AppState.chartSettings[chartIndex] = settings;
    this.renderChart(chartIndex);
  },

  createPlotlyChart(chartIndex, chartData) {
    const plotId = `plot_${chartIndex}`;
    const settings = window.AppState.chartSettings[chartIndex] || {
      chartType: 'scatter',
      lineWidth: 2,
      showMarkers: true,
      scaleType: 'linear'
    };
    
    const traces = this.prepareTraces(chartData, settings);
    const layout = this.prepareLayout(chartIndex, chartData, settings);
    const config = {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      responsive: true,
      displaylogo: false
    };
    
    Plotly.newPlot(plotId, traces, layout, config);
  },

  prepareTraces(chartData, settings) {
    const percentageData = chartData.filter(item => item.type === 'percentage');
    const absoluteData = chartData.filter(item => item.type === 'absolute');
    const colors = ['#3182ce', '#ed8936', '#38a169', '#e53e3e', '#805ad5', '#a1887f', '#ed64a6', '#718096'];
    let colorIndex = 0;
    
    const traces = [];
    
    percentageData.forEach(item => {
      traces.push(this.createTrace(item, settings, colors[colorIndex++ % colors.length], 'y'));
    });
    
    absoluteData.forEach(item => {
      traces.push(this.createTrace(item, settings, colors[colorIndex++ % colors.length], 'y2'));
    });
    
    return traces;
  },

  createTrace(item, settings, color, yaxis) {
    return {
      x: item.dates,
      y: item.values,
      type: settings.chartType,
      mode: settings.showMarkers && settings.chartType === 'scatter' ? 'lines+markers' : 'lines',
      name: item.parameter,
      line: { color, width: settings.lineWidth },
      marker: { size: 8, symbol: 'circle', line: { width: 1, color: '#fff' } },
      yaxis
    };
  },

  prepareLayout(chartIndex, chartData, settings) {
    const percentageData = chartData.filter(item => item.type === 'percentage');
    const absoluteData = chartData.filter(item => item.type === 'absolute');
    
    const layout = {
      title: {
        text: `График ${chartIndex + 1}`,
        font: { size: 18, color: '#2d3748' },
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        title: 'Дата',
        gridcolor: '#e2e8f0',
        linecolor: '#718096',
        linewidth: 1,
        tickangle: 45
      },
      yaxis: {
        title: percentageData.length > 0 ? 'Проценты (%)' : 'Значения',
        side: 'left',
        gridcolor: '#e2e8f0',
        linecolor: '#718096',
        linewidth: 1,
        type: settings.scaleType,
        showgrid: true
      },
      yaxis2: {
        title: absoluteData.length > 0 ? 'Абсолютные значения' : '',
        side: 'right',
        overlaying: 'y',
        gridcolor: '#e2e8f0',
        linecolor: '#718096',
        linewidth: 1,
        type: settings.scaleType,
        showgrid: false
      },
      legend: {
        x: 0.5,
        y: -0.2,
        xanchor: 'center',
        yanchor: 'top',
        orientation: 'h',
        font: { size: 12 }
      },
      margin: { l: 80, r: 80, t: 80, b: 100 },
      showlegend: true,
      hovermode: 'x unified',
      plot_bgcolor: '#f8fafc',
      paper_bgcolor: '#ffffff',
      font: { family: 'Inter, sans-serif', color: '#2d3748' }
    };
    
    if (percentageData.length === 0) {
      delete layout.yaxis2;
      layout.traces?.forEach(trace => trace.yaxis = 'y');
    } else if (absoluteData.length === 0) {
      delete layout.yaxis2;
    }
    
    return layout;
  },

  closeChart(chartIndex) {
    const chartContainer = document.getElementById(`chart_${chartIndex}`);
    if (chartContainer) chartContainer.remove();
    
    while (window.AppState.chartsVisible.length <= chartIndex) {
      window.AppState.chartsVisible.push(false);
    }
    
    window.AppState.chartsVisible[chartIndex] = false;
    window.TableManager.renderLists();
  }
};