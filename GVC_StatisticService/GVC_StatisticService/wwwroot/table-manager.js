const TableManager = {
  config: null,

  paramToTagClass: {
    'входной_поток_всего': 'tag-blue',
    'цифровые_сервисы_всего': 'tag-green',
    'роботы': 'tag-purple',
    'чат_боты': 'tag-brown',
    'входной_поток_АС_ОЗ': 'tag-yellow',
    'цифровые_сервисы_АС_ОЗ': 'tag-blue',
    'входной_поток_не_АС_ОЗ': 'tag-green', 
    'цифровые_сервисы_не_АС_ОЗ': 'tag-purple',
    'самостоятельность': 'tag-brown',
    'процент_цифровых_сервисов': 'tag-yellow',
    'процент_роботов': 'tag-blue',
    'процент_чат_ботов': 'tag-green',
    'процент_АС_О': 'tag-purple',
    'процент_не_АС_ОЗ': 'tag-brown',
    'процент_самостоятельности': 'tag-yellow',

    'default': 'tag-blue'
  },

  init(config) {
  this.config = config;
  this.setupEventListeners();
  
  // Инициализируем настройки графиков
  if (!window.AppState.chartSettings) {
    window.AppState.chartSettings = [];
  }
  
  // Инициализируем диапазоны дат для каждого списка
  if (!window.AppState.dateRangesByList) {
    window.AppState.dateRangesByList = [{ startDate: '', endDate: '' }];
  }
  
  // Инициализируем selectedDates как Set
  if (!window.AppState.selectedDates) {
    window.AppState.selectedDates = new Set();
  }
  
  // Инициализируем настройки тоглов для каждой табы
  if (!window.AppState.tabToggles) {
    window.AppState.tabToggles = [{}]; // Каждый элемент - объект с настройками для конкретной табы
  }
  
  // Определяем доступные тоглы (можно вынести в конфиг)
  this.availableToggles = [
    { key: 'showGrid', label: 'Сетка', default: true },
    { key: 'showLegend', label: 'Легенда', default: true },
    { key: 'smoothLines', label: 'Сглаживание', default: false },
    { key: 'showPoints', label: 'Точки', default: true },
    { key: 'showTrend', label: 'Тренд', default: false }
  ];
},






 calculateAggregatedValue(field, filteredData) {
  const values = filteredData
    .map(entry => {
      let value = entry[field];

      // Убираем % и делим на 100, если это строка-процент
      if (typeof value === 'string' && value.endsWith('%')) {
        value = parseFloat(value.replace('%', '')) / 100;
      }

      return parseFloat(value) || 0;
    })
    .filter(v => !isNaN(v));

  if (values.length === 0) return 'N/A';

  // Если это поле-процент — считаем среднее арифметическое и возвращаем с %
  if (field.startsWith('процент_')) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return (avg * 100).toFixed(1) + '%';
  } else {
    // Для остальных — просто сумма
    const sum = values.reduce((sum, val) => sum + val, 0);
    return sum.toFixed(1);
  }
},


  setupEventListeners() {
    // Кнопка поворота таблицы
    document.getElementById(this.config.toggleButton).addEventListener('click', () => {
      window.AppState.transposed = !window.AppState.transposed;
      this.render();
      this.updateToggleButtonText();
    });

    // Кнопка загрузки данных
    document.getElementById(this.config.loadDataButton).addEventListener('click', () => {
      this.loadData();
    });

    // Обновляем текст кнопки при инициализации
    this.updateToggleButtonText();
  },

  updateToggleButtonText() {
    const button = document.getElementById(this.config.toggleButton);
    button.textContent = window.AppState.transposed ? 'Вертикальный вид' : 'Горизонтальный вид';
  },


syncTabToggles() {
  while (window.AppState.tabToggles.length < window.AppState.selectedParamsByList.length) {
    // Создаем новый объект с дефолтными значениями для новой табы
    const defaultToggles = {};
    this.availableToggles.forEach(toggle => {
      defaultToggles[toggle.key] = toggle.default;
    });
    window.AppState.tabToggles.push(defaultToggles);
  }
},

addNewList() {
  window.AppState.selectedParamsByList.push([]);
  window.AppState.activeListIndex = window.AppState.selectedParamsByList.length - 1;
  
  // Добавляем новый диапазон дат для нового списка
  window.AppState.dateRangesByList.push({ startDate: '', endDate: '' });
  
  // Синхронизируем состояние графиков
  this.syncChartsState();
  
  this.renderTabs();
  this.render();
  
  // Переключаемся на новый таб
  this.switchTab(window.AppState.activeListIndex);
},



  syncChartsState() {
    while (window.AppState.chartsVisible.length < window.AppState.selectedParamsByList.length) {
      window.AppState.chartsVisible.push(false);
    }
  },

  formatEntry(entry) {
    const result = { ...entry };
    if (result.дата_отчета) {
      result.дата_отчета_raw = new Date(result.дата_отчета);
      result.дата_отчета = new Date(result.дата_отчета).toLocaleDateString("ru-RU");
    }
    for (let key in result) {
      if (key.startsWith("процент_")) {
        result[key] = (result[key] * 100).toFixed(1) + "%";
      }
    }
    return result;
  },

  formatDateForAPI(dateString) {
    return dateString;
  },

  async loadData() {
    try {
      const startDate = document.getElementById(this.config.startDateInput).value;
      const endDate = document.getElementById(this.config.endDateInput).value;
      
      if (!startDate || !endDate) {
        alert("Пожалуйста, выберите диапазон дат");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert("Дата начала не может быть больше даты окончания");
        return;
      }
      
      const formattedStartDate = this.formatDateForAPI(startDate);
      const formattedEndDate = this.formatDateForAPI(endDate);
      
      const url = new URL(this.config.apiUrl);
      url.searchParams.append('startDate', formattedStartDate);
      url.searchParams.append('endDate', formattedEndDate);
      
      console.log("Запрос к URL:", url.toString());
      
      // Показываем индикатор загрузки
      this.showLoadingState();
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Получены данные:", data);
      
      if (!data || data.length === 0) {
        alert("Нет данных для выбранного диапазона дат");
        return;
      }
      
      // Сбрасываем состояние приложения
      this.resetAppState(data);
      
      this.render();
      this.renderTabs();
      this.hideLoadingState();
      
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      alert("Ошибка загрузки данных: " + error.message);
      this.hideLoadingState();
    }
  },

 resetAppState(data) {
  window.AppState.originalData = data;
  window.AppState.selectedParamsByList = [[]];
  window.AppState.selectedDates = new Set();
  window.AppState.selectedCells = new Set(); // Сбрасываем выделенные ячейки
  window.AppState.activeListIndex = 0;
  window.AppState.chartsVisible = [false];
  window.AppState.dateRangesByList = [{ startDate: '', endDate: '' }];
},

  showLoadingState() {
    const button = document.getElementById(this.config.loadDataButton);
    button.textContent = "Загрузка...";
    button.disabled = true;
  },

  hideLoadingState() {
    const button = document.getElementById(this.config.loadDataButton);
    button.textContent = "Загрузить данные";
    button.disabled = false;
  },

  toggleParam(param) {
    const list = window.AppState.selectedParamsByList[window.AppState.activeListIndex];
    const index = list.indexOf(param);
    const tabContentContainer = document.querySelector('.tab-content-container');
    const wasHidden = tabContentContainer?.classList.contains('hidden') || false;
    
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(param);
    }
    this.renderTabs(wasHidden);
    this.render();
  },

  updateDateRange(listIndex, startDate, endDate) {
    window.AppState.dateRangesByList[listIndex] = { startDate, endDate };
    
    // Обновляем информацию о диапазоне
    this.updateDateRangeInfo(listIndex, startDate, endDate);
    
    // Если это активный список, обновляем отображение
    if (listIndex === window.AppState.activeListIndex) {
      this.render();
    }
  },

 updateDateRangeInfo(listIndex, startDate, endDate) {
  const infoElement = document.querySelector(`#tab-content-${listIndex} .date-range-info`);
  if (!infoElement) return;
  
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj <= endDateObj) {
      const diffTime = Math.abs(endDateObj - startDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      infoElement.textContent = `Выбран диапазон: ${diffDays} ${this.getDayWord(diffDays)}`;
      infoElement.classList.remove('error');
      infoElement.classList.add('success');
    } else {
      infoElement.textContent = 'Некорректный диапазон дат';
      infoElement.classList.remove('success');
      infoElement.classList.add('error');
    }
  } else {
    infoElement.textContent = 'Выберите диапазон дат';
    infoElement.classList.remove('success', 'error');
  }
},

  getDayWord(days) {
    if (days === 1) return 'день';
    if (days >= 2 && days <= 4) return 'дня';
    return 'дней';
  },

  validateDateRange(startInput, endInput) {
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    
    // Сброс классов
    startInput.classList.remove('error', 'success');
    endInput.classList.remove('error', 'success');
    
    if (startInput.value && endInput.value) {
      if (startDate > endDate) {
        startInput.classList.add('error');
        endInput.classList.add('error');
        return false;
      } else {
        startInput.classList.add('success');
        endInput.classList.add('success');
        return true;
      }
    }
    
    return true;
  },

  getSelectedDatesForList(listIndex) {
    const dateRange = window.AppState.dateRangesByList[listIndex];
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return [];
    }

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    return window.AppState.originalData
      .map(entry => entry.дата_отчета)
      .filter(date => {
        const entryDate = new Date(date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .sort((a, b) => new Date(a) - new Date(b));
  },

renderTabs() {
  const container = document.getElementById(this.config.listsContainer);
  container.innerHTML = "";
  
  // Синхронизируем состояние графиков с количеством списков
  this.syncChartsState();
  this.syncDateRanges();
  
  // Создаем контейнер для табов
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-container';

  // Проверяем существование tab-nav
  let tabNav = document.querySelector('.tab-nav');
  if (!tabNav) {
    tabNav = document.createElement('div');
    tabNav.className = 'tab-nav';
    tabsContainer.appendChild(tabNav);
  }
  
  // Очищаем существующий tab-nav
  tabNav.innerHTML = '';
  
  // Создаем кнопки табов
  window.AppState.selectedParamsByList.forEach((params, index) => {
  const tabBtn = document.createElement('button');
  tabBtn.className = 'tab-btn';

  // Кнопка удаления списка - ИСПРАВЛЕНО: передаем правильный индекс
  const KillBtn = document.createElement('button');
  KillBtn.className = 'btn btn-xs btn-overlay right';
  KillBtn.textContent = '🗙';
  KillBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Предотвращаем переключение на таб при клике на кнопку удаления
    this.deleteList(index); // Удаляем таб с правильным индексом
  });

  if (index === window.AppState.activeListIndex) {
    tabBtn.classList.add('active');
  }
  
  const tabLabel = document.createElement('span');
  tabLabel.textContent = `График ${index + 1}`;
  
  const paramCounter = document.createElement('span');
  paramCounter.className = 'param-counter';
  paramCounter.textContent = params.length;
  
  tabBtn.appendChild(paramCounter);
  tabBtn.appendChild(tabLabel);
  tabBtn.appendChild(KillBtn);
  
  tabBtn.addEventListener('click', () => {
    this.switchTab(index);
  });
  
  tabNav.appendChild(tabBtn);
});
  
  // Кнопка добавления нового таба
  const addTabBtn = document.createElement('button');
  addTabBtn.className = 'btn btn-xs btn-secondary';
  addTabBtn.textContent = '+';
  addTabBtn.addEventListener('click', () => {
    this.addNewList();
  });

  // Кнопка сокрытия/показа tab-content-container
  const toggleTabContentBtn = document.createElement('button');
  toggleTabContentBtn.className = 'btn btn-xs btn-secondary end';
  toggleTabContentBtn.textContent = window.AppState.isTabContentHidden ? '+' : '–';
  toggleTabContentBtn.addEventListener('click', () => {
    const tabContentContainer = document.querySelector('.tab-content-container');
    if (tabContentContainer) {
      tabContentContainer.classList.toggle('hidden');
      window.AppState.isTabContentHidden = tabContentContainer.classList.contains('hidden');
      toggleTabContentBtn.textContent = window.AppState.isTabContentHidden ? '+' : '–';
    }
  });

  // Кнопка показа/скрытия графика
  const GraphBtn = document.createElement('button');
  GraphBtn.className = 'btn btn-xs btn-secondary first';
  GraphBtn.textContent = window.AppState.chartsVisible[window.AppState.activeListIndex] ? '📉' : '📉';
  GraphBtn.addEventListener('click', () => {
    const isChartVisible = window.AppState.chartsVisible[window.AppState.activeListIndex];
    if (isChartVisible) {
      window.ChartManager.closeChart(window.AppState.activeListIndex);
    } else {
      window.ChartManager.showChart(window.AppState.activeListIndex);
    }
    GraphBtn.textContent = window.AppState.chartsVisible[window.AppState.activeListIndex] ? '📉' : '📉';
  });

  const tabBtnContainer = document.createElement('div');
  tabBtnContainer.className = 'tab-btn-container end';

  tabNav.appendChild(addTabBtn);
  tabNav.appendChild(tabBtnContainer);
  tabNav.appendChild(GraphBtn);

  tabBtnContainer.appendChild(toggleTabContentBtn);
  tabsContainer.appendChild(tabNav);
  
  // Создаем контейнер для содержимого табов
  const tabContentContainerNew = document.createElement('div');
  tabContentContainerNew.className = 'tab-content-container';
  if (window.AppState.isTabContentHidden) {
    tabContentContainerNew.classList.add('hidden');
  }
  
  // Создаем контент табов
  window.AppState.selectedParamsByList.forEach((params, index) => {
    const tabContent = this.createTabContent(params, index);
    tabContentContainerNew.appendChild(tabContent);
  });
  
  tabsContainer.appendChild(tabContentContainerNew);
  container.appendChild(tabsContainer);
},

 createTabContent(params, index) {
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  tabContent.id = `tab-content-${index}`;

  if (index !== window.AppState.activeListIndex) {
    tabContent.style.display = 'none';
  }

  // Create a flex container for tags and date filters
  const flexContainer = document.createElement('div');
  flexContainer.className = 'tab-content-flex';

  // Контейнер для тегов
  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'tags-container';

  if (params.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Ничего не выбрано';
    tagsContainer.appendChild(emptyMessage);
  } else {
    params.forEach(param => {
      const tag = document.createElement('span');
      tag.className = 'tag';

      // Получаем цветовой класс для параметра
      const colorClass = this.paramToTagClass[param] || this.paramToTagClass['default'];
      tag.classList.add(colorClass);

      tag.textContent = param;
      tag.addEventListener('click', () => {
        this.toggleParam(param);
      });
      tagsContainer.appendChild(tag);
    });
  }

  // Контейнер для выбора дат
  const dateFilters = this.createDateFilters(index);

  // Append both to flex container
  flexContainer.appendChild(dateFilters);
  flexContainer.appendChild(tagsContainer);

  tabContent.appendChild(flexContainer);

  return tabContent;
},

 createDateFilters(index) {
  const dateFilters = document.createElement('div');
  dateFilters.className = 'listDateFilters';
  
  const dateRange = window.AppState.dateRangesByList[index];
  
  const startFilterDiv = document.createElement('div');
  startFilterDiv.className = 'date-filter-small';
  
  const startLabel = document.createElement('label');
  startLabel.setAttribute('for', `tab-start-${index}`);
  startLabel.textContent = 'От:';
  
  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.id = `tab-start-${index}`;
  startInput.className = 'form-input';
  startInput.value = dateRange.startDate || '2025-07-01';
  
  startFilterDiv.appendChild(startLabel);
  startFilterDiv.appendChild(startInput);
  
  const endFilterDiv = document.createElement('div');
  endFilterDiv.className = 'date-filter-small';
  
  const endLabel = document.createElement('label');
  endLabel.setAttribute('for', `tab-end-${index}`);
  endLabel.textContent = 'До:';
  
  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.id = `tab-end-${index}`;
  endInput.className = 'form-input';
  endInput.value = dateRange.endDate || '2025-07-31';
  
  endFilterDiv.appendChild(endLabel);
  endFilterDiv.appendChild(endInput);
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'date-range-info';
  infoDiv.textContent = 'Выберите диапазон дат';
  
  dateFilters.appendChild(startFilterDiv);
  dateFilters.appendChild(endFilterDiv);
  dateFilters.appendChild(infoDiv);
  
  // Обработчики событий
  const handleStartChange = (e) => {
    this.validateDateRange(startInput, endInput);
    this.updateDateRange(index, e.target.value, endInput.value);
  };
  
  const handleEndChange = (e) => {
    this.validateDateRange(startInput, endInput);
    this.updateDateRange(index, startInput.value, e.target.value);
  };
  
  startInput.addEventListener('change', handleStartChange);
  endInput.addEventListener('change', handleEndChange);
  
  // Программно вызываем обработчики для инициализации состояния с дефолтными значениями
  setTimeout(() => {
    // Если в dateRange уже есть значения, используем их
    if (dateRange.startDate || dateRange.endDate) {
      this.validateDateRange(startInput, endInput);
      this.updateDateRange(index, startInput.value, endInput.value);
    } else {
      // Иначе устанавливаем дефолтные значения и вызываем обработчики
      const defaultStartDate = '2025-07-01';
      const defaultEndDate = '2025-07-31';
      
      startInput.value = defaultStartDate;
      endInput.value = defaultEndDate;
      
      this.validateDateRange(startInput, endInput);
      this.updateDateRange(index, defaultStartDate, defaultEndDate);
    }
  }, 0);
  
  return dateFilters;
},

updateDateRange(listIndex, startDate, endDate) {
  // Убеждаемся, что массив dateRangesByList достаточно большой
  while (window.AppState.dateRangesByList.length <= listIndex) {
    window.AppState.dateRangesByList.push({ startDate: '', endDate: '' });
  }
  
  window.AppState.dateRangesByList[listIndex] = { startDate, endDate };
  
  // Обновляем информацию о диапазоне
  this.updateDateRangeInfo(listIndex, startDate, endDate);
  
  // Если это активный список, обновляем отображение
  if (listIndex === window.AppState.activeListIndex) {
    this.render();
  }
},

  switchTab(index) {
    window.AppState.activeListIndex = index;
    
    // Обновляем активные кнопки
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Показываем/скрываем контент
    document.querySelectorAll('.tab-content').forEach((content, i) => {
      if (i === index) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
    
    
    // Обновляем таблицу
    this.render();
  },

  syncDateRanges() {
    while (window.AppState.dateRangesByList.length < window.AppState.selectedParamsByList.length) {
      window.AppState.dateRangesByList.push({ startDate: '', endDate: '' });
    }
  },

  render() {
    const container = document.getElementById(this.config.tableContainer);
    container.innerHTML = "";

    const formattedData = window.AppState.originalData.map(this.formatEntry);
    if (formattedData.length === 0) {
      container.innerHTML = "<p class='no-data'>Нет данных для отображения</p>";
      return;
    }

    // Фильтруем данные по диапазону дат активного списка
    const activeListDates = this.getSelectedDatesForList(window.AppState.activeListIndex);
    const filteredData = activeListDates.length > 0 
      ? formattedData.filter(entry => 
          activeListDates.some(date => 
            new Date(date).getTime() === entry.дата_отчета_raw.getTime()
          )
        )
      : formattedData;

    if (filteredData.length === 0) {
      container.innerHTML = "<p class='no-data'>Нет данных для выбранного диапазона дат</p>";
      return;
    }

    const fields = Object.keys(formattedData[0]).filter(f => f !== "id" && f !== "дата_отчета_raw");
    const table = document.createElement("table");

    if (!window.AppState.transposed) {
      this.renderNormalTable(table, filteredData, fields);
    } else {
      this.renderTransposedTable(table, filteredData, fields);
    }

    container.appendChild(table);

    updateStyles();
  },

renderNormalTable(table, formattedData, fields) {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const dateHeader = document.createElement("th");
  dateHeader.textContent = "Дата";
  dateHeader.className = "date-column";
  headerRow.appendChild(dateHeader);

  // Удалено: колонка "Итого"

  fields.filter(f => f !== "дата_отчета").forEach(field => {
    const th = document.createElement("th");
    th.textContent = field;
    th.title = `Нажмите для ${window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field) ? 'удаления из' : 'добавления в'} график`;
    if (window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field)) {
      th.classList.add("selected");
    }
    th.addEventListener("click", () => this.toggleParam(field));
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  const validData = formattedData.filter(entry => entry.дата_отчета_raw instanceof Date);
  const selectedData = validData.filter(entry => window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime()));
  const unselectedData = validData.filter(entry => !window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime()));

  const tableData = [...selectedData.sort((a, b) => a.дата_отчета_raw - b.дата_отчета_raw),
                     ...unselectedData.sort((a, b) => a.дата_отчета_raw - b.дата_отчета_raw)];

  const validKeys = new Set(tableData.flatMap(entry => 
    fields.filter(f => f !== "дата_отчета").map(field => `${entry.дата_отчета_raw.getTime()}-${field}`)
  ));
  window.AppState.selectedCells = new Set([...window.AppState.selectedCells].filter(key => validKeys.has(key)));

  // Строка агрегированных значений
  const aggregateRow = document.createElement("tr");
  aggregateRow.classList.add("aggregate-row");

  const aggregateDateCell = document.createElement("td");
  aggregateDateCell.textContent = "Итого";
  aggregateDateCell.className = "date-column aggregate-cell";
  aggregateRow.appendChild(aggregateDateCell);

  // Удалено: пустая ячейка под "Итого"

  fields.filter(f => f !== "дата_отчета").forEach(field => {
    const aggregateCell = document.createElement("td");
    const aggregatedValue = this.calculateAggregatedValue(field, tableData);
    aggregateCell.textContent = aggregatedValue;
    aggregateCell.className = "aggregate-cell";
    aggregateRow.appendChild(aggregateCell);
  });

  tbody.appendChild(aggregateRow);

  // Обычные строки
  tableData.forEach(entry => {
    const row = document.createElement("tr");
    if (entry.дата_отчета_raw instanceof Date && window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime())) {
      row.classList.add("pinned-date");
    }

    const dateCell = document.createElement("td");
    dateCell.textContent = entry.дата_отчета || "Нет даты";
    dateCell.className = "date-column";
    if (entry.дата_отчета_raw instanceof Date && window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime())) {
      dateCell.classList.add("selected");
    }
    dateCell.addEventListener("click", () => {
      if (entry.дата_отчета_raw instanceof Date) {
        const timestamp = entry.дата_отчета_raw.getTime();
        if (window.AppState.selectedDates.has(timestamp)) {
          window.AppState.selectedDates.delete(timestamp);
        } else {
          window.AppState.selectedDates.add(timestamp);
        }
        this.render();
      }
    });
    row.appendChild(dateCell);

    // Удалено: пустая ячейка "Итого"

    fields.filter(f => f !== "дата_отчета").forEach(field => {
      const cell = document.createElement("td");
      cell.textContent = entry[field] || "";
      const cellKey = entry.дата_отчета_raw instanceof Date ? `${entry.дата_отчета_raw.getTime()}-${field}` : null;
      if (cellKey && window.AppState.selectedCells.has(cellKey)) {
        cell.classList.add("selectedcell");
      }
      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        if (cellKey) {
          if (window.AppState.selectedCells.has(cellKey)) {
            window.AppState.selectedCells.delete(cellKey);
          } else {
            window.AppState.selectedCells.add(cellKey);
          }
          this.render();
        }
      });
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
}
,

renderTransposedTable(table, formattedData, fields) {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  
  const paramHeader = document.createElement("th");
  paramHeader.textContent = "Показатель";
  paramHeader.className = "param-column";
  headerRow.appendChild(paramHeader);

  // Добавляем колонку агрегированных значений
  const aggregateHeader = document.createElement("th");
  aggregateHeader.textContent = "Итого";
  aggregateHeader.className = "param-column aggregate-column";
  headerRow.appendChild(aggregateHeader);

  const validData = formattedData.filter(entry => entry.дата_отчета_raw instanceof Date);
  const selectedEntries = validData.filter(entry => window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime()));
  const unselectedEntries = validData.filter(entry => !window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime()));
  
  const tableEntries = [...selectedEntries.sort((a, b) => a.дата_отчета_raw - b.дата_отчета_raw), 
                       ...unselectedEntries.sort((a, b) => a.дата_отчета_raw - b.дата_отчета_raw)];

  tableEntries.forEach((entry, index) => {
    const th = document.createElement("th");
    th.textContent = entry.дата_отчета || "Нет даты";
    th.className = "date-column";
    if (entry.дата_отчета_raw instanceof Date && window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime())) {
      th.classList.add("selected");
    }
    th.addEventListener("click", () => {
      if (entry.дата_отчета_raw instanceof Date) {
        const timestamp = entry.дата_отчета_raw.getTime();
        if (window.AppState.selectedDates.has(timestamp)) {
          window.AppState.selectedDates.delete(timestamp);
        } else {
          window.AppState.selectedDates.add(timestamp);
        }
        this.render();
      }
    });
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  // Очищаем устаревшие ключи selectedCells
  const validKeys = new Set(tableEntries.flatMap(entry => 
    fields.filter(f => f !== "дата_отчета").map(field => `${entry.дата_отчета_raw.getTime()}-${field}`)
  ));
  window.AppState.selectedCells = new Set([...window.AppState.selectedCells].filter(key => validKeys.has(key)));

  fields.filter(f => f !== "дата_отчета").forEach(field => {
    const row = document.createElement("tr");
    const paramCell = document.createElement("td");
    paramCell.textContent = field;
    paramCell.className = "param-column";
    paramCell.title = `Нажмите для ${window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field) ? 'удаления из' : 'добавления в'} график`;
    if (window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field)) {
      paramCell.classList.add("selected");
    }
    paramCell.addEventListener("click", () => this.toggleParam(field));
    row.appendChild(paramCell);

    // Добавляем ячейку с агрегированным значением
    const aggregateCell = document.createElement("td");
    const aggregatedValue = this.calculateAggregatedValue(field, tableEntries);
    aggregateCell.textContent = aggregatedValue;
    aggregateCell.className = "param-column aggregate-column aggregate-cell";
    row.appendChild(aggregateCell);

    tableEntries.forEach((entry, index) => {
      const cell = document.createElement("td");
      cell.textContent = entry[field] || "";
      const cellKey = entry.дата_отчета_raw instanceof Date ? `${entry.дата_отчета_raw.getTime()}-${field}` : null;
      if (cellKey && window.AppState.selectedCells.has(cellKey)) {
        cell.classList.add("selectedcell");
      }
      if (entry.дата_отчета_raw instanceof Date && window.AppState.selectedDates.has(entry.дата_отчета_raw.getTime())) {
        cell.classList.add("pinned-date");
      }
      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        if (cellKey) {
          if (window.AppState.selectedCells.has(cellKey)) {
            window.AppState.selectedCells.delete(cellKey);
          } else {
            window.AppState.selectedCells.add(cellKey);
          }
          this.render();
        }
      });
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
},


  getSortedData(formattedData) {
    const sortedData = [...formattedData];
    sortedData.sort((a, b) => new Date(a.дата_отчета_raw) - new Date(b.дата_отчета_raw));
    return sortedData;
  },

  getSelectedParams() {
    return window.AppState.selectedParamsByList[window.AppState.activeListIndex];
  },

  getSelectedDates() {
    return this.getSelectedDatesForList(window.AppState.activeListIndex);
  },

  getSelectedDatesForChart(listIndex) {
    return this.getSelectedDatesForList(listIndex);
  },

  getFormattedData() {
    return window.AppState.originalData.map(this.formatEntry);
  },

  getRawData() {
    return window.AppState.originalData;
  },

  deleteList(index) {
    if (window.AppState.selectedParamsByList.length <= 1) {
      alert("Нельзя удалить последний график!");
      return;
    }
    
    // Закрываем график если он открыт
    if (window.AppState.chartsVisible && window.AppState.chartsVisible[index]) {
      window.ChartManager.closeChart(index);
    }
    
    // Удаляем список
    window.AppState.selectedParamsByList.splice(index, 1);
    
    // Удаляем диапазон дат
    window.AppState.dateRangesByList.splice(index, 1);
    
    // Удаляем состояние графика
    if (window.AppState.chartsVisible) {
      window.AppState.chartsVisible.splice(index, 1);
    }
    
    // Корректируем активный индекс
    if (window.AppState.activeListIndex >= index) {
      window.AppState.activeListIndex = Math.max(0, window.AppState.activeListIndex - 1);
    }

    this.renderTabs();
    this.render();
  },

  // Алиас для совместимости
  renderLists() {
    this.renderTabs();
  }
};