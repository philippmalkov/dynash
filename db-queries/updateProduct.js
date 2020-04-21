const db = require('../db/db');
const tools = require('../db/generation/tools');

function updateProduct(product) {
  return db.updateItem({
    TableName: 'Product',
    Key: {
      Id: {
        S: product.Id.S,
      },
    },
    UpdateExpression: 'SET Price = Price + :d50',
    ExpressionAttributeValues: {
      ':d50': {
        N: tools.d2c(50).toString(),
      },
    },
    ReturnValues: 'UPDATED_NEW',
  }).promise();
}

module.exports = updateProduct;
