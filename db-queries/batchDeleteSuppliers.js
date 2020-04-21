const db = require('../db/db');

const splitSize = 25;

async function batchDeleteSuppliers(supplierIds) {
  /* eslint-disable no-await-in-loop */
  for (let sptIdx = 0; sptIdx < supplierIds.length; sptIdx += splitSize) {
    const supplierIdsPart = supplierIds.slice(sptIdx, sptIdx + splitSize);

    await db.batchWriteItem({
      RequestItems: {
        Supplier: supplierIdsPart.map(id => ({
          DeleteRequest: {
            Key: {
              Id: { S: id },
            },
          },
        })),
      },
    }).promise();
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = batchDeleteSuppliers;
