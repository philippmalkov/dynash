const db = require('../db/db');

function scanSuppliersByNameBeginning(allSuppliers, first3Letters) {
  return db.scan({
    TableName: 'Supplier',
    FilterExpression: 'begins_with(#n, :rn)',
    ExpressionAttributeNames: {
      '#n': 'Name',
    },
    ExpressionAttributeValues: {
      ':rn': {
        S: first3Letters,
      },
    },
  }).promise();
}

module.exports = scanSuppliersByNameBeginning;
