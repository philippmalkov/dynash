const CommonResponse = require('./common');

/**
 * Parses getItem method's response
 * @constructor
 * @param {DynamoDB.GetItemInput} request
 * @param {DynamoDB.GetItemOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);

  const itemsCount = response.Item ? 1 : 0;
  return {
    common: commonResponse,
    tables: [{
      tableName: request.TableName,
      sentCount: 0,
      receivedCount: itemsCount,
      processedCount: itemsCount,
      consumedCapacity: response.ConsumedCapacity,
    }],
  };
};
