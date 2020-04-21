const lo = require('lodash');
const db = require('../db/db');
const tools = require('../db/generation/tools');

const splitSize = 25;

async function updateProductsViaTransaction(allProducts, numberOfProductsToUpdate) {
  const uniqueProducts = tools.UniqueList(allProducts.Items);
  const randomProductsForUpdate = lo
    .range(0, numberOfProductsToUpdate)
    .map(() => uniqueProducts.next().value);

  /* eslint-disable no-await-in-loop */
  for (let sptIdx = 0; sptIdx < randomProductsForUpdate.length; sptIdx += splitSize) {
    const products = randomProductsForUpdate.slice(sptIdx, sptIdx + splitSize);

    await db.transactWriteItems({
      TransactItems: products.map(p => ({
        Update: {
          Key: {
            Id: { S: p.Id.S },
          },
          TableName: 'Product',
          UpdateExpression: 'SET Price = Price - :d30',
          ExpressionAttributeValues: {
            ':d30': {
              N: tools.d2c(30).toString(),
            },
          },
        },
      })),
    }).promise();
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = updateProductsViaTransaction;
