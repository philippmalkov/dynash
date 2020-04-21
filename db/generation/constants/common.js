const path = require('path');

module.exports = {
  tables: ['Department', 'Product', 'Supplier', 'SupplierProduct'],
  outputDirectory: path.resolve(__dirname, '../generated'),
};
