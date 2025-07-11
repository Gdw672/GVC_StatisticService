// table-manager.js - Модуль для управления таблицей
const TableManager = {
  config: null,

  init(config) {
    this.config = config;
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Кнопка поворота таблицы
    document.getElementById(this.config.toggleButton).addEventListener('click', () => {
      window.AppState.transposed = !window.AppState.transposed;
      this.render();
    });

    // Кнопка добавления нового графика
    document.getElementById(this.config.addListButton).addEventListener('click', () => {
      window.AppState.selectedParamsByList.push([]);
      window.AppState.activeListIndex = window.AppState.selectedParamsByList.length - 1;
      this.renderLists();
      this.render();
    });
  },

  formatEntry(entry) {
    const result = { ...entry };
    if (result.дата_отчета) {
      result.дата_отчета_raw = new Date(result.дата_отчета);
      result.дата_отчета = new Date(result.дата_отчета).toLocaleDateString("ru-RU");
    }
    for (let key in result) {
      if (key.startsWith("процент_")) {
        result[key] = (result[key] * 100).toFixed(0) + " %";
      }
    }
    return result;
  },

  async loadData() {
    try {
      const response = await fetch(this.config.apiUrl);
      const data = await response.json();
      window.AppState.originalData = data;
      this.render();
      this.renderLists();
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  },

  toggleParam(param) {
    const list = window.AppState.selectedParamsByList[window.AppState.activeListIndex];
    const index = list.indexOf(param);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(param);
    }
    this.renderLists();
    this.render();
    
    // Уведомляем модуль графиков об изменении
    if (window.ChartManager) {
      window.ChartManager.onParamsChanged();
    }
  },

  toggleDate(rawDate) {
    const timestamp = new Date(rawDate).getTime();
    const index = window.AppState.selectedDates.findIndex(d => new Date(d).getTime() === timestamp);
    if (index >= 0) {
      window.AppState.selectedDates.splice(index, 1);
    } else {
      window.AppState.selectedDates.push(rawDate);
    }
    window.AppState.selectedDates.sort((a, b) => new Date(a) - new Date(b));
    this.render();
    
    // Уведомляем модуль графиков об изменении
    if (window.ChartManager) {
      window.ChartManager.onDatesChanged();
    }
  },

  renderLists() {
    const container = document.getElementById(this.config.listsContainer);
    container.innerHTML = "";
    
    window.AppState.selectedParamsByList.forEach((params, index) => {
      const block = document.createElement("div");
      block.className = "listBlock";
      if (index === window.AppState.activeListIndex) block.classList.add("active");

      block.innerHTML = "<strong>График " + (index + 1) + ":</strong> ";
      params.forEach(p => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerText = p;
        block.appendChild(tag);
      });

      block.addEventListener("click", () => {
        window.AppState.activeListIndex = index;
        this.renderLists();
        this.render();
        
        // Уведомляем модуль графиков об изменении активного списка
        if (window.ChartManager) {
          window.ChartManager.onActiveListChanged();
        }
      });
      
      container.appendChild(block);
    });
  },

  render() {
    const container = document.getElementById(this.config.tableContainer);
    container.innerHTML = "";

    const formattedData = window.AppState.originalData.map(this.formatEntry);
    if (formattedData.length === 0) return;

    const fields = Object.keys(formattedData[0]).filter(f => f !== "id" && f !== "дата_отчета_raw");
    const table = document.createElement("table");

    if (!window.AppState.transposed) {
      this.renderNormalTable(table, formattedData, fields);
    } else {
      this.renderTransposedTable(table, formattedData, fields);
    }

    container.appendChild(table);
  },

  renderNormalTable(table, formattedData, fields) {
    // Заголовки
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")).innerText = "Дата";

    fields.filter(f => f !== "дата_отчета").forEach(field => {
      const th = document.createElement("th");
      th.innerText = field;
      if (window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field)) {
        th.classList.add("selected");
      }
      th.addEventListener("click", () => this.toggleParam(field));
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Данные
    const tbody = document.createElement("tbody");
    const sortedData = this.getSortedData(formattedData);

    sortedData.forEach(entry => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.innerText = entry.дата_отчета;
      const isSelected = window.AppState.selectedDates.some(
        d => new Date(d).getTime() === entry.дата_отчета_raw.getTime()
      );
      if (isSelected) {
        dateCell.classList.add("selected");
      }
      dateCell.addEventListener("click", () => this.toggleDate(entry.дата_отчета_raw));
      row.appendChild(dateCell);

      fields.filter(f => f !== "дата_отчета").forEach(field => {
        const cell = document.createElement("td");
        cell.innerText = entry[field];
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
  },

  renderTransposedTable(table, formattedData, fields) {
    // Заголовки (даты)
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")).innerText = "Показатель";

    const sortedDates = this.getSortedData(formattedData);
    sortedDates.forEach(entry => {
      const th = document.createElement("th");
      th.innerText = entry.дата_отчета;
      const isSelected = window.AppState.selectedDates.some(
        d => new Date(d).getTime() === entry.дата_отчета_raw.getTime()
      );
      if (isSelected) th.classList.add("selected");
      th.addEventListener("click", () => this.toggleDate(entry.дата_отчета_raw));
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Данные (параметры как строки)
    const tbody = document.createElement("tbody");
    fields.filter(f => f !== "дата_отчета").forEach(field => {
      const row = document.createElement("tr");
      const paramCell = document.createElement("td");
      paramCell.innerText = field;
      if (window.AppState.selectedParamsByList[window.AppState.activeListIndex].includes(field)) {
        paramCell.classList.add("selected");
      }
      paramCell.addEventListener("click", () => this.toggleParam(field));
      row.appendChild(paramCell);

      sortedDates.forEach(entry => {
        const cell = document.createElement("td");
        cell.innerText = entry[field];
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
  },

  getSortedData(formattedData) {
    const sortedData = [...formattedData];
    const priority = window.AppState.selectedDates.map(d => new Date(d).toLocaleDateString("ru-RU"));
    
    sortedData.sort((a, b) => {
      const ia = priority.indexOf(a.дата_отчета);
      const ib = priority.indexOf(b.дата_отчета);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return new Date(b.дата_отчета_raw) - new Date(a.дата_отчета_raw);
    });
    
    return sortedData;
  },

  // Публичные методы для использования другими модулями
  getSelectedParams() {
    return window.AppState.selectedParamsByList[window.AppState.activeListIndex];
  },

  getSelectedDates() {
    return window.AppState.selectedDates;
  },

  getFormattedData() {
    return window.AppState.originalData.map(this.formatEntry);
  },

  getRawData() {
    return window.AppState.originalData;
  }
};