const ChartManager = {
  config: null,
  plotlyLoaded: false,
  chartSettings: {}, // Настройки для каждого графика

  init(config) {
    this.config = config;
    this.initializeState();
    this.plotlyLoaded = true;
  },

  initializeState() {
    window.AppState.chartsVisible = window.AppState.chartsVisible || [];
  },

  initChartSettings(chartIndex) {
  if (!this.chartSettings[chartIndex]) {
    this.chartSettings[chartIndex] = {
      showMarkers: true,
      showValues: false,
      smoothing: 0.5, // Увеличили начальное значение
      showGrid: true, // Новая настройка
      textSize: 10,   // Новая настройка
      textBold: true, // Новая настройка
      colors: {}
    };
  }
},

  showChart(listIndex) {
    if (ChartManager.config !== null) {
      // Инициализируем настройки для этого графика
      this.initChartSettings(listIndex);
    } else {
      console.warn("ChartManager ещё не инициализирован");
    }

    while (window.AppState.chartsVisible.length <= listIndex) {
      window.AppState.chartsVisible.push(false);
    }
    
    window.AppState.chartsVisible[listIndex] = true;
    this.renderChart(listIndex);
    window.TableManager.renderLists();
  },

  renderChart(chartIndex, attempts = 0) {
    const maxAttempts = 50;

    if (typeof Plotly === 'undefined') {
      if (attempts >= maxAttempts) {
        console.error('Plotly не удалось загрузить за отведенное время');
        this.handleEmptySelection(chartIndex, 'Ошибка загрузки библиотеки графиков');
        return;
      }
      
      console.log(`Plotly ещё не загружен (попытка ${attempts + 1}/${maxAttempts})`);
      setTimeout(() => this.renderChart(chartIndex, attempts + 1), 100);
      return;
    }

    if (!window.AppState || !window.AppState.selectedParamsByList) {
      console.error('AppState или selectedParamsByList не инициализированы');
      this.handleEmptySelection(chartIndex, 'Ошибка инициализации данных');
      return;
    }

    if (!window.TableManager) {
      console.error('TableManager не найден');
      this.handleEmptySelection(chartIndex, 'Ошибка доступа к данным');
      return;
    }

    const selectedParams = window.AppState.selectedParamsByList[chartIndex];
    const selectedDates = window.TableManager.getSelectedDatesForChart(chartIndex);
    const rawData = window.TableManager.getRawData();

    if (!selectedParams || selectedParams.length === 0) {
      this.handleEmptySelection(chartIndex, 'Выберите параметры для графика!');
      return;
    }

    if (!selectedDates || selectedDates.length === 0) {
      this.handleEmptySelection(chartIndex, 'Укажите диапазон дат для графика!');
      return;
    }

    if (!rawData || rawData.length === 0) {
      this.handleEmptySelection(chartIndex, 'Нет данных для построения графика!');
      return;
    }

    const chartData = this.prepareChartData(rawData, selectedParams, selectedDates);
    const containerCreated = this.createChartContainer(chartIndex);
    
    if (containerCreated) {
      this.createPlotlyChart(chartIndex, chartData);
    }
  },

  handleEmptySelection(chartIndex, message) {
    console.log(message, chartIndex + 1);
    alert(message);
    
    if (window.AppState && window.AppState.chartsVisible) {
      window.AppState.chartsVisible[chartIndex] = false;
    }
    
    if (window.TableManager && typeof window.TableManager.renderLists === 'function') {
      window.TableManager.renderLists();
    }
  },

  createTextControl(chartIndex) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  // Размер текста
  const sizeContainer = document.createElement('div');
  sizeContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 3px;
  `;

  const sizeLeftArrow = document.createElement('span');
  sizeLeftArrow.textContent = '◀';
  sizeLeftArrow.style.cssText = `
    cursor: pointer;
    font-size: 8px;
    color: #718096;
    transition: color 0.2s ease;
  `;

  const sizeText = document.createElement('span');
  sizeText.textContent = `T:${this.chartSettings[chartIndex].textSize}`;
  sizeText.style.cssText = `
    font-size: 10px;
    color: #4a5568;
    min-width: 25px;
    text-align: center;
  `;

  const sizeRightArrow = document.createElement('span');
  sizeRightArrow.textContent = '▶';
  sizeRightArrow.style.cssText = `
    cursor: pointer;
    font-size: 8px;
    color: #718096;
    transition: color 0.2s ease;
  `;

  sizeLeftArrow.addEventListener('click', () => {
    this.chartSettings[chartIndex].textSize = Math.max(8, this.chartSettings[chartIndex].textSize - 1);
    this.updateChart(chartIndex);
    sizeText.textContent = `T:${this.chartSettings[chartIndex].textSize}`;
  });

  sizeRightArrow.addEventListener('click', () => {
    this.chartSettings[chartIndex].textSize = Math.min(16, this.chartSettings[chartIndex].textSize + 1);
    this.updateChart(chartIndex);
    sizeText.textContent = `T:${this.chartSettings[chartIndex].textSize}`;
  });

  [sizeLeftArrow, sizeRightArrow].forEach(arrow => {
    arrow.addEventListener('mouseover', () => arrow.style.color = '#2d3748');
    arrow.addEventListener('mouseout', () => arrow.style.color = '#718096');
  });

  // Жирность текста
  const boldToggle = this.createTextButton('Ж', () => {
    this.chartSettings[chartIndex].textBold = !this.chartSettings[chartIndex].textBold;
    this.updateChart(chartIndex);
    this.updateButtonState(boldToggle, this.chartSettings[chartIndex].textBold);
  });
  boldToggle.style.fontSize = '10px';
  boldToggle.style.fontWeight = 'bold';
  boldToggle.style.minWidth = '25px';
  this.updateButtonState(boldToggle, this.chartSettings[chartIndex].textBold);

  sizeContainer.appendChild(sizeLeftArrow);
  sizeContainer.appendChild(sizeText);
  sizeContainer.appendChild(sizeRightArrow);

  container.appendChild(sizeContainer);
  container.appendChild(boldToggle);

  return container;
},


  prepareChartData(rawData, selectedParams, selectedDates) {
    try {
      const filteredData = rawData
        .filter(entry => {
          if (!entry || !entry.дата_отчета) return false;
          return selectedDates.some(d => {
            try {
              return new Date(entry.дата_отчета).getTime() === new Date(d).getTime();
            } catch (e) {
              console.warn('Ошибка парсинга даты:', entry.дата_отчета, d);
              return false;
            }
          });
        })
        .sort((a, b) => {
          try {
            return new Date(a.дата_отчета) - new Date(b.дата_отчета);
          } catch (e) {
            console.warn('Ошибка сортировки дат:', a.дата_отчета, b.дата_отчета);
            return 0;
          }
        });

      return selectedParams.map(param => ({
        parameter: param,
        values: filteredData.map(entry => {
          if (param.startsWith("процент_") && typeof entry[param] === 'number') {
            return entry[param] * 100;
          }
          return entry[param] || 0;
        }),
        dates: filteredData.map(entry => {
          try {
            return new Date(entry.дата_отчета).toLocaleDateString("ru-RU");
          } catch (e) {
            console.warn('Ошибка форматирования даты:', entry.дата_отчета);
            return entry.дата_отчета;
          }
        }),
        type: this.getParameterType(param)
      }));
    } catch (error) {
      console.error('Ошибка подготовки данных для графика:', error);
      return [];
    }
  },

  getParameterType(param) {
    return param.startsWith("процент_") ? 'percentage' : 'absolute';
  },

  createChartContainer(chartIndex) {
    console.log("ChartManager.config:", this.config);
    if (!this.config || !this.config.chartsContainer) {
      console.error('Конфигурация ChartManager не инициализирована или отсутствует chartsContainer');
      return false;
    }

    const chartsContainer = document.getElementById(this.config.chartsContainer);
    if (!chartsContainer) {
      console.error(`Charts container '${this.config.chartsContainer}' не найден`);
      return false;
    }

    const chartId = `chart_${chartIndex}`;
    
    let chartContainer = document.getElementById(chartId);
    if (chartContainer) {
      console.log(`Контейнер графика ${chartId} уже существует`);
      return true;
    }

    try {
      chartContainer = document.createElement('div');
      chartContainer.id = chartId;
      chartContainer.className = 'section';
      chartContainer.style.cssText = `
        margin: 20px 0;
        padding: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        width: 100%;
        display: block;
      `;
      
      const header = this.createChartHeader(chartIndex);
      const plotContainer = this.createPlotContainer(chartIndex);
      
      if (header && plotContainer) {
        chartContainer.appendChild(header);
        chartContainer.appendChild(plotContainer);
        chartsContainer.appendChild(chartContainer);
        return true;
      } else {
        console.error('Не удалось создать элементы графика');
        return false;
      }
    } catch (error) {
      console.error('Ошибка создания контейнера графика:', error);
      return false;
    }
  },

  createChartHeader(chartIndex) {
    try {
      const header = document.createElement('div');
      header.className = 'chartHeader';
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
      `;
      
      // Контейнер настроек
      const settingsContainer = this.createSettingsContainer(chartIndex);
      
      // Кнопка закрытия
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
      
      header.appendChild(settingsContainer);
      header.appendChild(closeButton);
      return header;
    } catch (error) {
      console.error('Ошибка создания заголовка графика:', error);
      return null;
    }
  },

  createSettingsContainer(chartIndex) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 12px;
    color: #4a5568;
  `;

  // Настройка точек
  const markersToggle = this.createTextButton('Точки', () => {
    this.chartSettings[chartIndex].showMarkers = !this.chartSettings[chartIndex].showMarkers;
    this.updateChart(chartIndex);
    this.updateButtonState(markersToggle, this.chartSettings[chartIndex].showMarkers);
  });
  this.updateButtonState(markersToggle, this.chartSettings[chartIndex].showMarkers);
  
  // Настройка значений
  const valuesToggle = this.createTextButton('Значения', () => {
    this.chartSettings[chartIndex].showValues = !this.chartSettings[chartIndex].showValues;
    this.updateChart(chartIndex);
    this.updateButtonState(valuesToggle, this.chartSettings[chartIndex].showValues);
  });
  this.updateButtonState(valuesToggle, this.chartSettings[chartIndex].showValues);

  // Настройка сетки
  const gridToggle = this.createTextButton('Сетка', () => {
    this.chartSettings[chartIndex].showGrid = !this.chartSettings[chartIndex].showGrid;
    this.updateChart(chartIndex);
    this.updateButtonState(gridToggle, this.chartSettings[chartIndex].showGrid);
  });
  this.updateButtonState(gridToggle, this.chartSettings[chartIndex].showGrid);

  // Настройка сглаживания
  const smoothingContainer = this.createSmoothingControl(chartIndex);

  // Настройка текста
  const textContainer = this.createTextControl(chartIndex);

  // Настройка цветов
  const colorsButton = this.createTextButton('Цвета', () => {
    this.showColorPicker(chartIndex);
  });

  container.appendChild(markersToggle);
  container.appendChild(valuesToggle);
  container.appendChild(gridToggle);
  container.appendChild(smoothingContainer);
  container.appendChild(textContainer);
  container.appendChild(colorsButton);

  return container;
},


  createTextButton(text, onClick) {
    const button = document.createElement('span');
    button.textContent = text;
    button.style.cssText = `
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      user-select: none;
    `;
    button.addEventListener('click', onClick);
    return button;
  },

  updateButtonState(button, isActive) {
    if (isActive) {
      button.style.background = '#e6fffa';
      button.style.color = '#00b894';
      button.style.fontWeight = 'bold';
    } else {
      button.style.background = '#f7fafc';
      button.style.color = '#718096';
      button.style.fontWeight = 'normal';
    }
  },

  createSmoothingControl(chartIndex) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 3px;
  `;

  const leftArrow = document.createElement('span');
  leftArrow.textContent = '◀';
  leftArrow.style.cssText = `
    cursor: pointer;
    font-size: 10px;
    color: #718096;
    transition: color 0.2s ease;
  `;
  leftArrow.addEventListener('click', () => {
    this.chartSettings[chartIndex].smoothing = Math.max(0, this.chartSettings[chartIndex].smoothing - 0.2); // Увеличили шаг
    this.updateChart(chartIndex);
    smoothingText.textContent = `Сглаж: ${Math.round(this.chartSettings[chartIndex].smoothing * 10)}`;
  });

  const smoothingText = document.createElement('span');
  smoothingText.textContent = `Сглаж: ${Math.round(this.chartSettings[chartIndex].smoothing * 10)}`;
  smoothingText.style.cssText = `
    font-size: 11px;
    color: #4a5568;
    min-width: 55px;
    text-align: center;
  `;

  const rightArrow = document.createElement('span');
  rightArrow.textContent = '▶';
  rightArrow.style.cssText = `
    cursor: pointer;
    font-size: 10px;
    color: #718096;
    transition: color 0.2s ease;
  `;
  rightArrow.addEventListener('click', () => {
    this.chartSettings[chartIndex].smoothing = Math.min(2, this.chartSettings[chartIndex].smoothing + 0.2); // Увеличили шаг и максимум
    this.updateChart(chartIndex);
    smoothingText.textContent = `Сглаж: ${Math.round(this.chartSettings[chartIndex].smoothing * 10)}`;
  });

  [leftArrow, rightArrow].forEach(arrow => {
    arrow.addEventListener('mouseover', () => arrow.style.color = '#2d3748');
    arrow.addEventListener('mouseout', () => arrow.style.color = '#718096');
  });

  container.appendChild(leftArrow);
  container.appendChild(smoothingText);
  container.appendChild(rightArrow);

  return container;
},

  showColorPicker(chartIndex) {
  const selectedParams = window.AppState.selectedParamsByList[chartIndex];
  if (!selectedParams) return;

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 450px;
    max-height: 70vh;
    overflow-y: auto;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Выбор цветов параметров';
  title.style.cssText = `
    margin: 0 0 15px 0;
    color: #2d3748;
    font-size: 16px;
  `;

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  content.appendChild(title);

  selectedParams.forEach(param => {
    const paramContainer = document.createElement('div');
    paramContainer.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    `;

    const paramTitle = document.createElement('div');
    paramTitle.textContent = param;
    paramTitle.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: #2d3748;
      font-size: 13px;
    `;

    const colorContainer = document.createElement('div');
    colorContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      align-items: center;
    `;

    // Стандартные цвета
    colors.forEach(color => {
      const colorButton = document.createElement('div');
      colorButton.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${color};
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid ${this.chartSettings[chartIndex].colors[param] === color ? '#000' : 'transparent'};
      `;

      colorButton.addEventListener('click', () => {
        this.chartSettings[chartIndex].colors[param] = color;
        this.updateColorSelection(colorContainer, color);
        this.updateChart(chartIndex);
      });

      colorContainer.appendChild(colorButton);
    });

    // Разделитель
    const separator = document.createElement('div');
    separator.style.cssText = `
      width: 2px;
      height: 24px;
      background: #e2e8f0;
      margin: 0 5px;
    `;
    colorContainer.appendChild(separator);

    // Произвольный цвет
    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.value = this.chartSettings[chartIndex].colors[param] || '#667eea';
    customColorInput.style.cssText = `
      width: 30px;
      height: 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      padding: 0;
    `;

    customColorInput.addEventListener('change', (e) => {
      this.chartSettings[chartIndex].colors[param] = e.target.value;
      this.updateColorSelection(colorContainer, e.target.value);
      this.updateChart(chartIndex);
    });

    const customLabel = document.createElement('span');
    customLabel.textContent = 'Свой';
    customLabel.style.cssText = `
      font-size: 11px;
      color: #718096;
      margin-left: 5px;
    `;

    colorContainer.appendChild(customColorInput);
    colorContainer.appendChild(customLabel);

    paramContainer.appendChild(paramTitle);
    paramContainer.appendChild(colorContainer);
    content.appendChild(paramContainer);
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрыть';
  closeButton.className = 'btn btn-primary'
  closeButton.style.cssText = `
    padding: 8px 16px;
    margin-top: 15px;
  `;
  closeButton.addEventListener('click', () => document.body.removeChild(modal));

  content.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
},

// Новый вспомогательный метод для обновления выбора цвета
updateColorSelection(container, selectedColor) {
  container.querySelectorAll('div').forEach(btn => {
    if (btn.style.background) {
      btn.style.border = '2px solid transparent';
    }
  });
  
  container.querySelectorAll('div').forEach(btn => {
    if (btn.style.background === selectedColor) {
      btn.style.border = '2px solid #000';
    }
  });
},

// Функция для затемнения цвета
darkenColor(color, amount = 0.3) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
},

// Обновленный метод создания трассировки
createTrace(item, color, yaxis, chartIndex) {
  try {
    const settings = this.chartSettings[chartIndex];
    const mode = settings.showMarkers ? 'lines+markers' : 'lines';
    
    const trace = {
      x: item.dates || [],
      y: item.values || [],
      type: 'scatter',
      mode: mode,
      name: item.parameter || 'Неизвестный параметр',
      line: { 
        color: color, 
        width: 3,
        shape: 'spline',
        smoothing: settings.smoothing
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

    if (settings.showMarkers) {
      trace.marker = { 
        size: 8, 
        symbol: 'circle', 
        line: { width: 2, color: '#fff' },
        color: color
      };
    }

    // Добавляем текстовые значения если включено
    if (settings.showValues) {
      trace.mode = settings.showMarkers ? 'lines+markers+text' : 'lines+text';
      trace.text = item.values.map(v => Math.round(v * 100) / 100);
      trace.textposition = 'top center';
      trace.textfont = {
        size: settings.textSize,
        color: this.darkenColor(color, 0.4), // Затемняем цвет
        family: 'Inter, sans-serif',
        // В Plotly используется weight вместо style для жирности
        weight: settings.textBold ? 'bold' : 'normal'
      };
      // Добавляем белую обводку через texttemplate (если поддерживается)
      trace.texttemplate = '%{text}';
    }

    return trace;
  } catch (error) {
    console.error('Ошибка создания трассировки:', error);
    return {};
  }
},


  updateChart(chartIndex) {
    const selectedParams = window.AppState.selectedParamsByList[chartIndex];
    const selectedDates = window.TableManager.getSelectedDatesForChart(chartIndex);
    const rawData = window.TableManager.getRawData();

    if (selectedParams && selectedDates && rawData) {
      const chartData = this.prepareChartData(rawData, selectedParams, selectedDates);
      this.createPlotlyChart(chartIndex, chartData);
    }
  },

  createPlotContainer(chartIndex) {
    try {
      const plotContainer = document.createElement('div');
      plotContainer.id = `plot_${chartIndex}`;
      plotContainer.className = 'chartPlot';
      plotContainer.style.cssText = `
        min-height: 600px;
        width: 100%;
      `;
      return plotContainer;
    } catch (error) {
      console.error('Ошибка создания контейнера для графика:', error);
      return null;
    }
  },

  createPlotlyChart(chartIndex, chartData) {
    const plotId = `plot_${chartIndex}`;
    
    const plotElement = document.getElementById(plotId);
    if (!plotElement) {
      console.error(`Элемент для графика '${plotId}' не найден`);
      return;
    }

    if (!chartData || chartData.length === 0) {
      console.error('Нет данных для построения графика');
      plotElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Нет данных для отображения</div>';
      return;
    }

    try {
      const traces = this.prepareTraces(chartData, chartIndex);
      const layout = this.prepareLayout(chartIndex, chartData);

      
      const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d', 'zoom2d', 'toImage'],
        responsive: true,
        displaylogo: false
        
      };
      
      
      Plotly.newPlot(plotId, traces, layout, config);
    } catch (error) {
      console.error('Ошибка создания графика Plotly:', error);
      plotElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f;">Ошибка построения графика</div>';
    }
  },

  prepareTraces(chartData, chartIndex) {
    try {
      const percentageData = chartData.filter(item => item && item.type === 'percentage');
      const absoluteData = chartData.filter(item => item && item.type === 'absolute');
      
      const defaultColors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
      ];
      
      let colorIndex = 0;
      const traces = [];
      
      percentageData.forEach(item => {
        if (item && item.dates && item.values) {
          const color = this.chartSettings[chartIndex].colors[item.parameter] || defaultColors[colorIndex++ % defaultColors.length];
          traces.push(this.createTrace(item, color, 'y', chartIndex));
        }
      });
      
      absoluteData.forEach(item => {
        if (item && item.dates && item.values) {
          const color = this.chartSettings[chartIndex].colors[item.parameter] || defaultColors[colorIndex++ % defaultColors.length];
          traces.push(this.createTrace(item, color, 'y2', chartIndex));
        }
      });
      
      return traces;
    } catch (error) {
      console.error('Ошибка подготовки трассировок:', error);
      return [];
    }
  },


  prepareLayout(chartIndex, chartData) {
  try {
    const settings = this.chartSettings[chartIndex];
    const percentageData = chartData.filter(item => item && item.type === 'percentage');
    const absoluteData = chartData.filter(item => item && item.type === 'absolute');
    
    const layout = {
      xaxis: {
        title: {
          font: { size: 14, color: '#4a5568' }
        },
        gridcolor: settings.showGrid ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        linecolor: '#e2e8f0',
        linewidth: 2,
        tickangle: -45,
        tickfont: { size: 11, color: '#718096' },
        showgrid: settings.showGrid,
        zeroline: false
      },
      yaxis: {
        title: {
          text: percentageData.length > 0 ? '<b>Проценты (%)</b>' : '<b>Значения</b>',
          font: { size: 14, color: '#4a5568' }
        },
        side: 'left',
        gridcolor: settings.showGrid ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        linecolor: '#e2e8f0',
        linewidth: 2,
        showgrid: settings.showGrid,
        zeroline: false,
        tickfont: { size: 11, color: '#718096' }
      },
      yaxis2: {
        title: {
          text: absoluteData.length > 0 ? '<b>Абсолютные значения</b>' : '',
          font: { size: 14, color: '#4a5568' }
        },
        side: 'right',
        overlaying: 'y',
        gridcolor: settings.showGrid ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
        linecolor: '#e2e8f0',
        linewidth: 2,
        showgrid: false,
        zeroline: false,
        tickfont: { size: 11, color: '#718096' }
      },
      legend: {
        x: 0.5,
        y: -0.4,
        xanchor: 'center',
        yanchor: 'top',
        orientation: 'h',
        font: { size: 12, color: '#4a5568' },
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: 'rgba(0, 0, 0, 0.1)',
        borderwidth: 1,
        itemsizing: 'constant',
        itemwidth: 30
      },
      margin: { l: 80, r: 80, t: 40, b: 200 },
      showlegend: true,
      hovermode: 'closest',
      plot_bgcolor: '#fafafa',
      paper_bgcolor: '#ffffff',
      font: { 
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
        color: '#2d3748' 
      },
      hoverdistance: 20,
      spikedistance: 100
    };
    
    if (percentageData.length === 0) {
      delete layout.yaxis2;
    } else if (absoluteData.length === 0) {
      delete layout.yaxis2;
    }
    
    return layout;
  } catch (error) {
    console.error('Ошибка создания макета графика:', error);
    return {};
  }
},

  closeChart(chartIndex) {
    try {
      const chartContainer = document.getElementById(`chart_${chartIndex}`);
      if (chartContainer) {
        chartContainer.style.transition = 'all 0.3s ease';
        chartContainer.style.opacity = '0';
        chartContainer.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (chartContainer.parentNode) {
            chartContainer.parentNode.removeChild(chartContainer);
          }
        }, 300);
      }
      
      // Удаляем настройки графика
      delete this.chartSettings[chartIndex];
      
      if (window.AppState && Array.isArray(window.AppState.chartsVisible)) {
        while (window.AppState.chartsVisible.length <= chartIndex) {
          window.AppState.chartsVisible.push(false);
        }
        window.AppState.chartsVisible[chartIndex] = false;
      }
      
      if (window.TableManager && typeof window.TableManager.renderLists === 'function') {
        window.TableManager.renderLists();
      }
    } catch (error) {
      console.error('Ошибка закрытия графика:', error);
    }
  }
};