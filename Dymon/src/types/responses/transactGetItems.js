const lo = require('lodash');

const CommonResponse = require('./common');

/**
 * Parses transactGetItems method's response
 * @constructor
 * @param {DynamoDB.TransactGetItemsInput} request
 * @param {DynamoDB.TransactGetItemsOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);

  const ccuGByTableName = lo.groupBy(response.ConsumedCapacity, 'TableName');

  const tables = lo.chain(request.TransactItems)
    .map((item, idx) => [item, lo.get(response.Responses, idx, null)])
    .groupBy('0.Get.TableName')
    .map(
      /** @returns {module:Dymon.TableResponse} */
      (items, tableName) => {
        const numberOfReceivedItems = items.filter(([, resp]) => !!resp).length;

        return {
          tableName,
          sentCount: 0,
          receivedCount: numberOfReceivedItems,
          processedCount: items.length,
          consumedCapacity: lo.first(ccuGByTableName[tableName]) || false,
        };
      },
    )
    .value();

  return {
    common: commonResponse,
    tables,
  };
};
