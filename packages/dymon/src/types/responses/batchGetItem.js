const lo = require('lodash');

const CommonResponse = require('./common');

/**
 * Parses batchGetItem method's response
 * @constructor
 * @param {DynamoDB.BatchGetItemInput} request
 * @param {DynamoDB.BatchGetItemOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);

  const ccuGByTableName = lo.groupBy(response.ConsumedCapacity, 'TableName');

  const tables = lo.map(
    request.RequestItems,
    /** @returns module:Dymon.TableResponse */
    (item, tableName) => {
      const numberOfSentKeys = item.Keys.length;

      const numberOfReceivedKeys = lo.get(response.Responses, `${tableName}.length`, 0);
      const numberOfUnprocessedKeys = lo.get(
        response.UnprocessedKeys,
        `${tableName}.Keys.length`, 0,
      );

      return {
        tableName,
        sentCount: 0,
        receivedCount: numberOfReceivedKeys,
        processedCount: numberOfSentKeys - numberOfUnprocessedKeys,
        consumedCapacity: lo.first(ccuGByTableName[tableName]) || false,
      };
    },
  );

  return {
    common: commonResponse,
    tables,
  };
};
