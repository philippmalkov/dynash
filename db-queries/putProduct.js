const db = require('../db/db');

function putProduct(product) {
  return db.putItem({
    TableName: 'Product',
    Item: product,
  }).promise();
}

module.exports = putProduct;
