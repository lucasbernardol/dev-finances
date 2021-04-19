/*
 * TableCSV - conversão de dados
 */

const TableCSV = {
  tableElement: document.querySelector('[data-export=transactions]'),
  exceptionMessage: 'the number of columns must be greater than zero',

  columns: 3,
  includeHeadings: true,

  /**
   * Get a new csv string
   */

  parse() {
    return this._getValues();
  },

  /**
   * This is a private method
   */

  _getValues() {
    const tableCells = this._getCellsData();

    const tmpArray = tableCells.map((cell) => {
      const temp = [];

      cell.forEach((cellElement, key) => {
        if (key < this.columns && this.columns > 0) {
          temp.push(cellElement.textContent.replace(/\,/g, '.'));
        }

        if (!this.columns) {
          console.log(this.exceptionMessage);
        }
      });

      return temp.join(',');
    });

    return tmpArray.join('\n');
  },

  /**
   * This is a private method
   */

  _getCellsData() {
    const tableRows = this._getRows();

    const tableCells = tableRows.map((row) => {
      return Array.from(row.cells);
    });

    return tableCells;
  },

  /**
   * This is a private method
   */

  _getRows() {
    const tableRows = Array.from(this.tableElement.rows);

    if (!this.includeHeadings) {
      tableRows.shift();
    }

    return tableRows;
  },
};

const BlobFileFormat = {
  create(data, htmlAnchorElement, options = {}) {
    const { type, fileName, extension, length, delay } = options;

    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const formatedFileName = this._formatFileName(fileName, extension, length);

    Attributes.add(htmlAnchorElement, {
      href: url,
      download: formatedFileName,
    });

    htmlAnchorElement.click();

    const resetAnchorAttributes = () => {
      URL.revokeObjectURL(url);
      Attributes.remove(htmlAnchorElement, ['href', 'download']);
    };

    setTimeout(resetAnchorAttributes, delay);
  },

  _formatFileName(name = '', extension = '') {
    let fileName = name.trim();

    if (fileName.length <= 0 && fileName !== null) {
      throw new Error('O nome do arquivo não pode ser vazio.');
    }

    if (!fileName.includes(extension)) {
      fileName += extension;
    }

    return fileName;
  },
};

/*
 * Export - Exportação de arquivos
 */

const Export = {
  anchorElement: document.querySelector('[data-download]'),

  csvFile() {
    try {
      const { NoTransactionsFound } = messages.alert;

      if (!Transaction.data.length) {
        throw new Error(NoTransactionsFound);
      }

      const fileName = Export.getFileName(
        'Digite o nome do arquivo, exemplo: tabela.csv.\nA extensão (.csv) é opcional.'
      );

      if (fileName === null) {
        return;
      }

      const data = TableCSV.parse();

      BlobFileFormat.create(data, Export.anchorElement, {
        type: 'text/csv;charset=utf-8',
        fileName: fileName,
        extension: '.csv',
        delay: Utils.secondsToMilliseconds(5),
      });
    } catch ({ message }) {
      Exception.setMessage(message);
      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  getFileName(message, defaultValue = '') {
    return prompt(message, defaultValue);
  },
};
