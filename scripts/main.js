/*
 * Storage
 */

const ApplicationStorage = {
  key: 'dev.finances:data',

  get(altkey) {
    const dataString = localStorage.getItem(altkey || ApplicationStorage.key);
    return ApplicationStorage._deserialize(dataString) || [];
  },

  set(data, altkey) {
    const string = ApplicationStorage._serialize(data);
    localStorage.setItem(altkey || ApplicationStorage.key, string);
  },

  // Private method
  _serialize(data) {
    return JSON.stringify(data);
  },

  // Private method
  _deserialize(string) {
    return JSON.parse(string);
  },

  clearStorage(boo = false) {
    if (boo) localStorage.clear();
  },
};

const messages = {
  alert: {
    optionNotSelect: 'Por favor, escolha uma transação.',
    emptyFilds: 'É necessário preencher todos campos.',
    NoTransactionsFound: 'Nenhuma transação encontrada.',
  },
};

const Styled = {
  body: document.body,

  aplly(htmlElement, styles = {}) {
    for (let property in styles) {
      const value = styles[property];
      htmlElement.style[property] = value;
    }
  },

  overflow(value = 'auto') {
    const { body } = Styled;
    body.style.overflow = value;
  },
};

const Attributes = {
  add(hmlElement, data = {}) {
    const keys = Object.keys(data);

    keys.forEach((key) => {
      hmlElement.setAttribute(key, data[key]);
    });
  },

  remove(hmlElement, data = []) {
    data.forEach((value) => {
      hmlElement.removeAttribute(value);
    });
  },
};

/*
 * Transaction - CRUD
 */

const Transaction = {
  data: ApplicationStorage.get(),

  incomes() {
    let income = 0;

    Transaction.data.forEach(({ amount }) => {
      if (amount > 0) income += amount;
    });

    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.data.forEach(({ amount }) => {
      if (amount < 0) expense += amount;
    });

    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },

  set({ description, amount, date }) {
    Transaction.data.unshift({
      description,
      amount,
      date,
    });
  },

  delete(index) {
    Transaction.data.splice(index, 1);
  },

  update(index, object) {
    for (let key in object) {
      if (object[key] !== '') {
        const value = object[key];
        Transaction.data[index][key] = value;
      }
    }
  },

  removeAll() {
    Transaction.data = [];
  },
};

/*
 * Exception - Exceções
 */

const Exception = {
  container: document.querySelector('.exception-container'),
  textView: document.querySelector('.exception-message'),

  className: 'active',
  handleTimeoutValue: null,

  // Private method
  _default() {
    if (Exception.handleTimeoutValue) {
      Exception.clearHandleTimeout();
    }
  },

  open() {
    Exception._default();
    const boolean = Exception._constaisClassName();

    if (!boolean) {
      Exception.container.classList.add(Exception.className);
    }
  },

  close() {
    Exception._default();
    const boolean = Exception._constaisClassName();

    if (boolean) {
      Exception.container.classList.remove(Exception.className);
    }
  },

  automatiacClosing(seconds = 5) {
    const milliseconds = Utils.secondsToMilliseconds(seconds);
    const isPresent = Exception._constaisClassName();

    const timeoutHandle = () => {
      Exception.close();
    };

    if (isPresent) {
      const handle = setTimeout(timeoutHandle, milliseconds);
      Exception._setHandleTimeout(handle);
    }
  },

  // Private method
  _constaisClassName(className = null) {
    const { classList } = Exception.container;

    return classList.contains(className || Exception.className);
  },

  clearHandleTimeout() {
    clearTimeout(Exception.handleTimeoutValue);
    Exception.handleTimeoutValue = null;
  },

  // Private method
  _setHandleTimeout(handle = null) {
    Exception.handleTimeoutValue = handle;
  },

  setMessage(message) {
    Exception.textView.textContent = message;
  },
};

/*
 * Modal
 */

const Modal = {
  modalOverlay: document.querySelector('[data-modal=transactions]'),

  open() {
    Modal.modalOverlay.classList.remove('hidden');
    Styled.overflow('hidden');
  },

  close() {
    Modal.modalOverlay.classList.add('hidden');
    Styled.overflow('auto');

    Form.clearFields();
  },
};

/*
 * Modal update
 */

const ModalUpdate = {
  overlay: document.querySelector('[data-modal=update]'),
  fields: document.querySelectorAll('[data-modal=update] input'),
  select: document.querySelector('[data-modal=update] select'),

  open() {
    try {
      if (!Transaction.data.length) {
        const { NoTransactionsFound } = messages.alert;
        throw new Error(NoTransactionsFound);
      }

      settingsModal.close();
      ModalUpdate.overlay.classList.remove('hidden');
      Styled.overflow('hidden');
    } catch ({ message }) {
      Exception.setMessage(message);
      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  close() {
    ModalUpdate.overlay.classList.add('hidden');
    Styled.overflow('auto');
    ModalUpdate.clearFields();
    settingsModal.open();
  },

  clearFields() {
    ModalUpdate.fields.forEach((field) => {
      field.value = '';
    });

    ModalUpdate.select.value = '';
  },

  removeSelectOptions() {
    const selectField = ModalUpdate.select;
    const optionsElement = selectField.querySelectorAll('option');

    optionsElement.forEach((option, key) => {
      if (key > 0) option.remove();
    });
  },
};

/*
 * FileModal
 */

const settingsModal = {
  overlay: document.querySelector('[data-modal=options]'),
  className: 'hidden',

  open() {
    settingsModal.overlay.classList.remove(settingsModal.className);
    Styled.overflow('hidden');
  },

  close() {
    settingsModal.overlay.classList.add(settingsModal.className);
    Styled.overflow('auto');
  },
};

/*
 * Form
 */

const Form = {
  fields: document.querySelectorAll('[data-modal=transactions] input'),

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const data = Form.formatValues();

      Transaction.set(data);
      Modal.close();

      ApplicationStorage.set(Transaction.get);
      App.reload();
    } catch ({ message }) {
      // Error alert
      Exception.setMessage(message);

      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  values() {
    const object = {};
    Form.fields.forEach((field) => {
      object[field.name] = field.value.trim();
    });

    return object;
  },

  validateFields() {
    const values = Form.values();
    let isEmpty;

    for (key in values) {
      if (values[key].length <= 0) {
        isEmpty = true;
        break;
      }
    }

    if (isEmpty) {
      const { emptyFilds } = messages.alert;
      throw new Error(emptyFilds);
    }
  },

  formatValues() {
    let { description, amount, date } = Form.values();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date };
  },

  clearFields() {
    Form.fields.forEach((field) => {
      field.value = '';
    });
  },
};

const FormUpdate = {
  submit(event) {
    event.preventDefault();

    try {
      const fields = ModalUpdate.fields;
      const key = ModalUpdate.select.value;

      if (!key) {
        const { optionNotSelect } = messages.alert;

        throw new Error(optionNotSelect);
      }

      let object = {};

      fields.forEach((field) => {
        if (field.value !== '') {
          let value = FormUpdate.formatValues(field.name, field.value);

          object[field.name] = value;
        }
      });

      Transaction.update(key, object);
      ModalUpdate.close();

      App.reload();
    } catch ({ message }) {
      Exception.setMessage(message);

      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  formatValues(name, value) {
    switch (name) {
      case 'amount':
        value = Utils.formatAmount(value);
        break;

      case 'date':
        value = Utils.formatDate(value);
        break;

      default:
        return value;
    }

    return value;
  },
};

/*
 * View
 */

const View = {
  tableBody: document.querySelector('tbody'),
  totalTransactions: document.querySelector('.total-transactions'),
  income: document.querySelector('.income-display'),
  expense: document.querySelector('.expense-display'),
  total: document.querySelector('.total-display'),
  transactionCount: document.querySelector('.transactions-count'),

  addTransaction(transaction, index) {
    const tableRow = document.createElement('tr');

    tableRow.innerHTML = View.createHtmlTemplate(transaction);
    tableRow.setAttribute('data-index', index);

    View.tableBody.appendChild(tableRow);
  },

  createHtmlTemplate({ description, amount, date }) {
    const className = amount >= 0 ? 'expense' : 'income';
    const formatedCurrency = Utils.formatCurrency(amount);

    const template = `
      <td class="description">${description}</td>
      <td class="${className}">${formatedCurrency}</td>
      <td class="date">${date}</td>
      <td class="remove" onclick="View.removeTransaction(this)">
        <img src="./assets/minus.svg" alt="Minus image" />
      </td>
    `;

    return template;
  },

  removeTransaction(target) {
    const { index } = target.parentNode.dataset;

    Transaction.delete(index);
    App.reload();
  },

  removeAllTransaction() {
    const { NoTransactionsFound } = messages.alert;
    try {
      if (!Transaction.data.length) {
        throw new Error(NoTransactionsFound);
      }

      const boolean = confirm('Deseja remover todas as transações ?');

      if (boolean) {
        Transaction.removeAll();
        settingsModal.close();
        App.reload();

        return;
      }
    } catch (error) {
      Exception.setMessage(error.message);

      Exception.open();
      Exception.automatiacClosing(8);
    }
  },

  updateBalance() {
    const incomes = Utils.formatCurrency(Transaction.incomes());
    const exprenses = Utils.formatCurrency(Transaction.expenses());
    const total = Utils.formatCurrency(Transaction.total());

    View.income.textContent = incomes;
    View.expense.textContent = exprenses;
    View.total.textContent = total;
  },

  updateTransactionsCount() {
    const count = String(Transaction.data.length).padStart(2, '0');

    View.transactionCount.textContent = count;
  },

  populateModal() {
    ModalUpdate.removeSelectOptions();

    const transactions = Transaction.data;

    transactions.forEach(({ description, amount }, index) => {
      const option = document.createElement('option');
      const money = Utils.formatCurrency(amount);

      option.textContent = `${description}, ${money}`;
      option.value = index;

      ModalUpdate.select.appendChild(option);
    });
  },

  clearView() {
    View.tableBody.innerHTML = '';
  },
};

const Time = {
  dateDisplay: document.querySelector('.date-display'),

  updateYear() {
    const fullYear = Time.getDate().getFullYear();
    Time.dateDisplay.textContent = fullYear;
  },

  getDate() {
    return new Date();
  },
};

const Utils = {
  formatCurrency(amount) {
    const signal = Number(amount) < 0 ? '-' : '';

    let value = String(amount).replace(/\D/gi, '');
    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `${signal} ${value}`;
  },

  formatAmount(amount) {
    return Number(Math.round(100 * amount));
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  secondsToMilliseconds(seconds = 0) {
    return Number(seconds) * 1000;
  },
};

const App = {
  init() {
    View.clearView();
    View.populateModal();
    View.updateBalance();
    View.updateTransactionsCount();

    Transaction.data.forEach(View.addTransaction);

    ApplicationStorage.set(Transaction.data);
  },

  reload() {
    App.init();
  },
};

const DOMContentLoadHandle = () => {
  App.init();
  Time.updateYear();
};

window.addEventListener('load', DOMContentLoadHandle);
