const db = require('../db/db');

function deleteProduct(product) {
  return db.deleteItem({
    TableName: 'Product',
    Key: {
      Id: { S: product.Id.S },
    },
  }).promise();
}

module.exports = deleteProduct;
