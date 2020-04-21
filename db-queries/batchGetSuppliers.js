const db = require('../db/db');

function batchGetSuppliers(supplierIds) {
  return db.batchGetItem({
    RequestItems: {
      Supplier: {
        Keys: supplierIds.map(id => ({
          Id: { S: id },
        })),
      },
    },
  }).promise();
}

module.exports = batchGetSuppliers;
