const db = require('../db/db');

function getProduct(product) {
  return db.getItem({
    TableName: 'Product',
    Key: {
      Id: { S: product.Id.S },
    },
  }).promise();
}

module.exports = getProduct;
