const lo = require('lodash');

const CommonResponse = require('./common');

/**
 * Parses transactWriteItems method's response
 * @constructor
 * @param {DynamoDB.TransactWriteItemsInput} request
 * @param {DynamoDB.TransactWriteItemsOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);

  const ccuGByTableName = lo.groupBy(response.ConsumedCapacity, 'TableName');

  const tables = lo.chain(request.TransactItems)
    .map(
      item => [
        lo.get(item, 'ConditionCheck', null),
        lo.get(item, 'Put', null),
        lo.get(item, 'Delete', null),
        lo.get(item, 'Update', null),
      ].filter(i => !!i),
    )
    .flatten()
    .groupBy('TableName')
    .map(
      /** @returns {module:Dymon.TableResponse} */
      (items, tableName) => ({
        tableName,
        sentCount: items.length,
        receivedCount: 0,
        processedCount: items.length,
        consumedCapacity: lo.first(ccuGByTableName[tableName]) || false,
      }),
    )
    .value();

  return {
    common: commonResponse,
    tables,
  };
};
