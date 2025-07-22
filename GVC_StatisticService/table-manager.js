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
    
    // Initialize chart settings
    if (!window.AppState.chartSettings) {
      window.AppState.chartSettings = [];
    }
    
    // Initialize date ranges for each list
    if (!window.AppState.dateRangesByList) {
      window.AppState.dateRangesByList = [{ startDate: '', endDate: '' }];
    }
    
    // Initialize pinned dates array
    if (!window.AppState.pinnedDates) {
      window.AppState.pinnedDates = [];
    }
  },

  setupEventListeners() {
    // Table transpose button
    document.getElementById(this.config.toggleButton).addEventListener('click', () => {
      window.AppState.transposed = !window.AppState.transposed;
      this.render();
      this.updateToggleButtonText();
    });

    // Data load button
    document.getElementById(this.config.loadDataButton).addEventListener('click', () => {
      this.loadData();
    });

    // Data check button
     document.getElementById(this.config.checkDataButton).addEventListener('click', () => {
      this.checkData();
    });

    // Update button text on initialization
    this.updateToggleButtonText();
  },

  updateToggleButtonText() {
    const button = document.getElementById(this.config.toggleButton);
    button.textContent = window.AppState.transposed ? 'Вертикальный вид' : 'Горизонтальный вид';
  },

  addNewList() {
    window.AppState.selectedParamsByList.push([]);
    window.AppState.activeListIndex = window.AppState.selectedParamsByList.length - 1;
    
    // Add new date range for the new list
    window.AppState.dateRangesByList.push({ startDate: '', endDate: '' });
    
    // Synchronize chart state
    this.syncChartsState();
    
    this.renderTabs();
    this.render();
    
    // Switch to the new tab
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
      
      // Show loading state
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
      
      // Reset application state
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

async checkData() {

  try {
    const startDate = document.getElementById('checkStartDate').value;
    const endDate = document.getElementById('checkEndDate').value;
    
    if (!startDate || !endDate) {
      logMessage("Не выбран диапазон дат для проверки");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      logMessage("Дата начала не может быть больше даты окончания");
      return;
    }
    
    const formattedStartDate = this.formatDateForAPI(startDate);
    const formattedEndDate = this.formatDateForAPI(endDate);
    
    const url = new URL(this.config.checkApiUrl);
    url.searchParams.append('startDate', formattedStartDate);
    url.searchParams.append('endDate', formattedEndDate);
    
    logMessage(`Проверка данных для периода ${formattedStartDate} - ${formattedEndDate}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Извлекаем имя файла из сообщения об ошибке
      const pathMatch = errorText.match(/Could not find a part of the path '.*?([^\\\/]+\.csv)'/);
      if (pathMatch) {
        logMessage(`${pathMatch[1]} не найден`);
      } else if (response.status === 500) {
        logMessage("Внутренняя ошибка сервера");
      } else if (response.status === 404) {
        logMessage("Данные не найдены");
      } else {
        logMessage(`Ошибка HTTP: ${response.status}`);
      }
      return;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      logMessage("Нет данных для выбранного диапазона дат");
      return;
    }
    
    logMessage(`Найдено ${data.length} записей данных`);
    logMessage("Проверка завершена успешно");
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logMessage("Ошибка подключения к серверу");
    } else if (error.message.includes('JSON')) {
      logMessage("Ошибка формата данных сервера");
    } else {
      logMessage(`Ошибка проверки данных: ${error.message}`);
    }
    console.error("Полная ошибка:", error);
  }
},

  resetAppState(data) {
    window.AppState.originalData = data;
    window.AppState.selectedParamsByList = [[]];
    window.AppState.selectedDates = [];
    window.AppState.pinnedDates = [];
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
    button.textContent = "Загрузить";
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

  togglePinnedDate(date) {
    const dateStr = new Date(date).toLocaleDateString("ru-RU");
    const index = window.AppState.pinnedDates.indexOf(dateStr);
    if (index >= 0) {
      window.AppState.pinnedDates.splice(index, 1);
    } else {
      window.AppState.pinnedDates.push(dateStr);
    }
    this.render();
  },

  updateDateRange(listIndex, startDate, endDate) {
    window.AppState.dateRangesByList[listIndex] = { startDate, endDate };
    
    // Update date range info
    this.updateDateRangeInfo(listIndex, startDate, endDate);
    
    // If this is the active list, update rendering
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
    
    // Reset classes
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

  renderTabs(wasHidden = false) {
    const container = document.getElementById(this.config.listsContainer);
    container.innerHTML = "";
    
    // Synchronize chart state and date ranges
    this.syncChartsState();
    this.syncDateRanges();
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';

    // Check for existing tab-nav
    let tabNav = document.querySelector('.tab-nav');
    if (!tabNav) {
      tabNav = document.createElement('div');
      tabNav.className = 'tab-nav';
      tabsContainer.appendChild(tabNav);
    }
    
    // Clear existing tab-nav
    tabNav.innerHTML = '';
    
    // Create tab buttons
    window.AppState.selectedParamsByList.forEach((params, index) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = 'tab-btn';

      // Delete list button
      const killBtn = document.createElement('button');
      
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
      killBtn.className = 'btn btn-xs btn-overlay right';
      killBtn.textContent = '🗙';
      killBtn.addEventListener('click', () => {
        this.deleteList(window.AppState.activeListIndex);
      });
      tabBtn.appendChild(killBtn);
      
      tabBtn.addEventListener('click', () => {
        this.switchTab(index);
      });
      
      tabNav.appendChild(tabBtn);
    });
    
    // Add new tab button
    const addTabBtn = document.createElement('button');
    addTabBtn.className = 'btn btn-xs btn-secondary';
    addTabBtn.textContent = '+';
    addTabBtn.addEventListener('click', () => {
      this.addNewList();
    });

    // Toggle tab content visibility button
    const toggleTabContentBtn = document.createElement('button');
    toggleTabContentBtn.className = 'btn btn-xs btn-secondary end';
    toggleTabContentBtn.textContent = wasHidden ? '+' : '–';
    toggleTabContentBtn.addEventListener('click', () => {
      const tabContentContainer = document.querySelector('.tab-content-container');
      if (tabContentContainer) {
        tabContentContainer.classList.toggle('hidden');
        toggleTabContentBtn.textContent = tabContentContainer.classList.contains('hidden') ? '+' : '–';
      }
    });

    


    // Show/hide chart button
    const graphBtn = document.createElement('button');
    graphBtn.className = 'btn btn-xs btn-secondary first';
    graphBtn.id = 'graph-button'; 
    graphBtn.textContent = window.AppState.chartsVisible[window.AppState.activeListIndex] ? '👁' : '👁';
    graphBtn.addEventListener('click', () => {
      logMessage("Нажалось!");
      const isChartVisible = window.AppState.chartsVisible[window.AppState.activeListIndex];
      if (isChartVisible) {
        window.ChartManager.closeChart(window.AppState.activeListIndex);
      } else {
        window.ChartManager.showChart(window.AppState.activeListIndex);
      }
      // Update button text after toggling
      graphBtn.textContent = window.AppState.chartsVisible[window.AppState.activeListIndex] ? '👁' : '👁';
    });

    const tabBtnContainer = document.createElement('div');
    tabBtnContainer.className = 'tab-btn-container end';

    tabNav.appendChild(addTabBtn);
    tabNav.appendChild(tabBtnContainer);
    tabNav.appendChild(graphBtn);

    tabBtnContainer.appendChild(toggleTabContentBtn);
    tabsContainer.appendChild(tabNav);
    
    // Create tab content container
    const tabContentContainerNew = document.createElement('div');
    tabContentContainerNew.className = 'tab-content-container';
    if (wasHidden) {
      tabContentContainerNew.classList.add('hidden');
    }
    
    // Create tab content
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
    
    // Tags container
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
        tag.textContent = param;
        
        // Assign tag class based on parameter mapping
        const tagClass = this.paramToTagClass[param] || this.paramToTagClass['default'];
        tag.classList.add(tagClass);
        
        tag.addEventListener('click', () => {
          this.toggleParam(param);
        });
        tagsContainer.appendChild(tag);
      });
    }
    
    // Date filters container
    const dateFilters = this.createDateFilters(index);
    
    tabContent.appendChild(tagsContainer);
    tabContent.appendChild(dateFilters);
    
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
    startInput.value = dateRange.startDate || '';
    
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
    endInput.value = dateRange.endDate || '';
    
    endFilterDiv.appendChild(endLabel);
    endFilterDiv.appendChild(endInput);
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'date-range-info';
    infoDiv.textContent = 'Выберите диапазон дат';
    
    dateFilters.appendChild(startFilterDiv);
    dateFilters.appendChild(endFilterDiv);
    dateFilters.appendChild(infoDiv);
    
    // Event listeners
    startInput.addEventListener('change', (e) => {
      this.validateDateRange(startInput, endInput);
      this.updateDateRange(index, e.target.value, endInput.value);
    });
    
    endInput.addEventListener('change', (e) => {
      this.validateDateRange(startInput, endInput);
      this.updateDateRange(index, startInput.value, e.target.value);
    });
    
    return dateFilters;
  },

  switchTab(index) {
    window.AppState.activeListIndex = index;
    
    // Update active buttons
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach((content, i) => {
      if (i === index) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
    
    // Update table
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

    // Filter data by active list's date range
    const activeListDates = this.getSelectedDatesForList(window.AppState.activeListIndex);
    const filteredData = activeListDates.length > 0 
      ? formattedData.filter(entry => 
          activeListDates.some(date => 
            new Date(date).toLocaleDateString("ru-RU") === entry.дата_отчета
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
  },

  renderNormalTable(table, formattedData, fields) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    const dateHeader = document.createElement("th");
    dateHeader.textContent = "Дата";
    dateHeader.className = "date-column";
    headerRow.appendChild(dateHeader);

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
    const sortedData = this.getSortedData(formattedData);

    // Separate pinned and unpinned data
    const pinnedData = sortedData.filter(entry => window.AppState.pinnedDates.includes(entry.дата_отчета));
    const unpinnedData = sortedData.filter(entry => !window.AppState.pinnedDates.includes(entry.дата_отчета));

    // Sort pinned dates in order of pinning
    const sortedPinnedData = window.AppState.pinnedDates
      .map(date => pinnedData.find(entry => entry.дата_отчета === date))
      .filter(entry => entry);

    const finalData = [...sortedPinnedData, ...unpinnedData];

    finalData.forEach(entry => {
      const row = document.createElement("tr");
      if (window.AppState.pinnedDates.includes(entry.дата_отчета)) {
        row.classList.add("pinned-date-row");
      }

      const dateCell = document.createElement("td");
      dateCell.textContent = entry.дата_отчета;
      dateCell.className = "date-column";
      if (window.AppState.pinnedDates.includes(entry.дата_отчета)) {
        dateCell.classList.add("selected");
      }
      dateCell.addEventListener("click", () => this.togglePinnedDate(entry.дата_отчета_raw));
      row.appendChild(dateCell);

      fields.filter(f => f !== "дата_отчета").forEach(field => {
        const cell = document.createElement("td");
        cell.textContent = entry[field];
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
  },

  renderTransposedTable(table, formattedData, fields) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    const paramHeader = document.createElement("th");
    paramHeader.textContent = "Показатель";
    paramHeader.className = "param-column";
    headerRow.appendChild(paramHeader);

    const sortedDates = this.getSortedData(formattedData);
    // Separate pinned and unpinned dates
    const pinnedDates = sortedDates.filter(entry => window.AppState.pinnedDates.includes(entry.дата_отчета));
    const unpinnedDates = sortedDates.filter(entry => !window.AppState.pinnedDates.includes(entry.дата_отчета));

    // Sort pinned dates in order of pinning
    const sortedPinnedDates = window.AppState.pinnedDates
      .map(date => pinnedDates.find(entry => entry.дата_отчета === date))
      .filter(entry => entry);

    const finalDates = [...sortedPinnedDates, ...unpinnedDates];

    finalDates.forEach(entry => {
      const th = document.createElement("th");
      th.textContent = entry.дата_отчета;
      th.className = "date-column";
      if (window.AppState.pinnedDates.includes(entry.дата_отчета)) {
        th.classList.add("selected");
      }
      th.addEventListener("click", () => this.togglePinnedDate(entry.дата_отчета_raw));
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
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

      finalDates.forEach(entry => {
        const cell = document.createElement("td");
        cell.textContent = entry[field];
        if (window.AppState.pinnedDates.includes(entry.дата_отчета)) {
          cell.classList.add("pinned-date-column");
        }
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
    
    // Close chart if open
    if (window.AppState.chartsVisible && window.AppState.chartsVisible[index]) {
      window.ChartManager.closeChart(index);
    }
    
    // Remove list
    window.AppState.selectedParamsByList.splice(index, 1);
    
    // Remove date range
    window.AppState.dateRangesByList.splice(index, 1);
    
    // Remove chart state
    if (window.AppState.chartsVisible) {
      window.AppState.chartsVisible.splice(index, 1);
    }
    
    // Adjust active index
    if (window.AppState.activeListIndex >= index) {
      window.AppState.activeListIndex = Math.max(0, window.AppState.activeListIndex - 1);
    }

    this.renderTabs();
    this.render();
  },

  

  // Alias for compatibility
  renderLists() {
    this.renderTabs();
  },

};

