const db = require('../db/db');

function getProductSuppliers(product) {
  return db.query({
    TableName: 'SupplierProduct',
    KeyConditionExpression: 'ProductId = :pid',
    ExpressionAttributeValues: {
      ':pid': {
        S: product.Id.S,
      },
    },
  }).promise();
}

module.exports = getProductSuppliers;
