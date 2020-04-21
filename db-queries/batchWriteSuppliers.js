const db = require('../db/db');

const splitSize = 25;

async function batchWriteSuppliers(suppliers) {
  /* eslint-disable no-await-in-loop */
  for (let sptIdx = 0; sptIdx < suppliers.length; sptIdx += splitSize) {
    const suppliersPart = suppliers.slice(sptIdx, sptIdx + splitSize);

    await db.batchWriteItem({
      RequestItems: {
        Supplier: suppliersPart.map(i => ({
          PutRequest: {
            Item: i,
          },
        })),
      },
    }).promise();
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = batchWriteSuppliers;
