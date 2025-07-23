const ChartManager = {
  config: null,
  plotlyLoaded: false,

  init(config) {
    this.config = config;
    this.initializeState();
    this.plotlyLoaded = true;
  },

  initializeState() {
    window.AppState.chartsVisible = window.AppState.chartsVisible || [];
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
    const selectedDates = window.TableManager.getSelectedDatesForChart(chartIndex);
    const rawData = window.TableManager.getRawData();

    if (selectedParams.length === 0) {
      this.handleEmptySelection(chartIndex, 'Выберите параметры для графика!');
      return;
    }

    if (selectedDates.length === 0) {
      this.handleEmptySelection(chartIndex, 'Укажите диапазон дат для графика!');
      return;
    }

    const chartData = this.prepareChartData(rawData, selectedParams, selectedDates);
    this.createChartContainer(chartIndex);
    this.createPlotlyChart(chartIndex, chartData);
  },

  handleEmptySelection(chartIndex, message) {
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
    chartContainer.style.cssText = `
      margin: 20px 0;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      width: 100%;
      display: block;
    `;
    
    chartContainer.appendChild(this.createChartHeader(chartIndex));
    chartContainer.appendChild(this.createPlotContainer(chartIndex));
    
    chartsContainer.appendChild(chartContainer);
  },

  createChartHeader(chartIndex) {
    const header = document.createElement('div');
    header.className = 'chartHeader';
    header.style.cssText = `
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'closeChartButton';
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      color: #718096;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.background = '#fed7d7';
      closeButton.style.borderColor = '#fc8181';
      closeButton.style.color = '#e53e3e';
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.background = '#f7fafc';
      closeButton.style.borderColor = '#e2e8f0';
      closeButton.style.color = '#718096';
    });
    closeButton.addEventListener('click', () => this.closeChart(chartIndex));
    
    header.appendChild(closeButton);
    
    return header;
  },

  createPlotContainer(chartIndex) {
    const plotContainer = document.createElement('div');
    plotContainer.id = `plot_${chartIndex}`;
    plotContainer.className = 'chartPlot';
    plotContainer.style.cssText = `
      min-height: 600px;
      width: 100%;
    `;
    return plotContainer;
  },

  createPlotlyChart(chartIndex, chartData) {
    const plotId = `plot_${chartIndex}`;
    
    const traces = this.prepareTraces(chartData);
    const layout = this.prepareLayout(chartIndex, chartData);
    const config = {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
      responsive: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: `график_${chartIndex + 1}`,
        height: 800,
        width: 1200,
        scale: 2
      }
    };
    
    Plotly.newPlot(plotId, traces, layout, config);
  },

  prepareTraces(chartData, theme) {
  const percentageData = chartData.filter(item => item.type === 'percentage');
  const absoluteData = chartData.filter(item => item.type === 'absolute');
  
  const colors = [
    '#FF0000', // Pure Red
    '#00FF00', // Pure Green
    '#0000FF', // Pure Blue
    '#FF00FF', // Pure Magenta
    '#00FFFF', // Pure Cyan
    '#FFFF00', // Pure Yellow
    '#FF4500', // OrangeRed
    '#32CD32', // LimeGreen
    '#1E90FF', // DodgerBlue
    '#FF69B4', // HotPink
    '#00CED1', // DarkTurquoise
    '#FFD700'  // Gold
  ];
  
  let colorIndex = 0;
  const traces = [];
  
  
  percentageData.forEach(item => {
    traces.push(this.createTrace(item, colors[colorIndex++ % colors.length], 'y', theme));
  });
  
  absoluteData.forEach(item => {
    traces.push(this.createTrace(item, colors[colorIndex++ % colors.length], 'y2', theme));
  });
  
  return traces;
},

  createTrace(item, color, yaxis) {
    return {
      x: item.dates,
      y: item.values,
      type: 'scatter',
      mode: 'lines+markers',
      name: item.parameter,
      line: { 
        color: color, 
        width: 3,
        shape: 'spline',
        smoothing: 0.3
      },
      marker: { 
        size: 8, 
        symbol: 'circle', 
        line: { width: 2, color: '#fff' },
        color: color
      },
      yaxis,
      hovertemplate: '<b>%{fullData.name}</b><br>' +
                     'Дата: %{x}<br>' +
                     'Значение: %{y}<br>' +
                     '<extra></extra>',
      hoverlabel: {
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        bordercolor: color,
        font: { color: '#2d3748', size: 12 }
      }
    };
  },

  prepareLayout(chartIndex, chartData, theme) {
  const percentageData = chartData.filter(item => item.type === 'percentage');
  const absoluteData = chartData.filter(item => item.type === 'absolute');
  
  const layout = {
    xaxis: {
      title: {
        font: { size: 14, color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }
      },
      linecolor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
      linewidth: 2,
      tickangle: -45,
      tickfont: { size: 11, color: theme === 'dark' ? '#a0aec0' : '#718096' },
      showgrid: false, // No grid lines
      zeroline: false
    },
    yaxis: {
      title: {
        text: percentageData.length > 0 ? '<b>Проценты (%)</b>' : '<b>Значения</b>',
        font: { size: 14, color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }
      },
      side: 'left',
      linecolor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
      linewidth: 2,
      showgrid: false, // No grid lines
      zeroline: false,
      tickfont: { size: 11, color: theme === 'dark' ? '#a0aec0' : '#718096' }
    },
    yaxis2: {
      title: {
        text: absoluteData.length > 0 ? '<b>Абсолютные значения</b>' : '',
        font: { size: 14, color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }
      },
      side: 'right',
      overlaying: 'y',
      linecolor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
      linewidth: 2,
      showgrid: false, // No grid lines
      zeroline: false,
      tickfont: { size: 11, color: theme === 'dark' ? '#a0aec0' : '#718096' }
    },
    legend: {
      x: 0.5,
      y: -0.4,
      xanchor: 'center',
      yanchor: 'top',
      orientation: 'h',
      font: { size: 12, color: theme === 'dark' ? '#e2e8f0' : '#4a5568' },
      bgcolor: theme === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      bordercolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderwidth: 1,
      itemsizing: 'constant',
      itemwidth: 30
    },
    margin: { l: 80, r: 80, t: 40, b: 200 },
    showlegend: true,
    hovermode: 'closest',
    plot_bgcolor: theme === 'dark' ? '#2d3748' : '#fafafa',
    paper_bgcolor: theme === 'dark' ? '#1a202c' : '#ffffff',
    font: { 
      family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
      color: theme === 'dark' ? '#e2e8f0' : '#4a5568' 
    },
    hoverdistance: 20,
    spikedistance: 100
  };
  
  if (percentageData.length === 0 || absoluteData.length === 0) {
    delete layout.yaxis2;
  }
  
  return layout;
},

  closeChart(chartIndex) {
    const chartContainer = document.getElementById(`chart_${chartIndex}`);
    if (chartContainer) {
      chartContainer.style.transition = 'all 0.3s ease';
      chartContainer.style.opacity = '0';
      chartContainer.style.transform = 'scale(0.95)';
      setTimeout(() => chartContainer.remove(), 300);
    }
    
    while (window.AppState.chartsVisible.length <= chartIndex) {
      window.AppState.chartsVisible.push(false);
    }
    
    window.AppState.chartsVisible[chartIndex] = false;
    window.TableManager.renderLists();
  }
};