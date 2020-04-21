const db = require('../db/db');

const splitSize = 25;

async function getSuppliersViaTransaction(supplierIds) {
  /* eslint-disable no-await-in-loop */
  for (let sptIdx = 0; sptIdx < supplierIds.length; sptIdx += splitSize) {
    const supplierIdsPart = supplierIds.slice(sptIdx, sptIdx + splitSize);

    await db.transactGetItems({
      TransactItems: supplierIdsPart.map(id => ({
        Get: {
          Key: {
            Id: { S: id },
          },
          TableName: 'Supplier',
        },
      })),
    }).promise();
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = getSuppliersViaTransaction;
