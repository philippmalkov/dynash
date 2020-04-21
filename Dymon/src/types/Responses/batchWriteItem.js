const lo = require('lodash');

const CommonResponse = require('./common');

/**
 * Parses batchWriteItem method's response
 * @constructor
 * @param {DynamoDB.BatchWriteItemInput} request
 * @param {DynamoDB.BatchWriteItemOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);

  const ccuGByTableName = lo.groupBy(response.ConsumedCapacity, 'TableName');

  const tables = lo.map(
    request.RequestItems,
    /** @returns module:Dymon.TableResponse */
    (items, tableName) => {
      const numberOfUnprocessedItems = lo.get(response.UnprocessedItems, `${tableName}.length`, 0);

      return {
        tableName,
        sentCount: items.length,
        receivedCount: 0,
        processedCount: items.length - numberOfUnprocessedItems,
        consumedCapacity: lo.first(ccuGByTableName[tableName]) || false,
      };
    },
  );

  return {
    common: commonResponse,
    tables,
  };
};
