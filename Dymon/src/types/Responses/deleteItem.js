const CommonResponse = require('./common');

/**
 * Parses deleteItem method's response
 * @constructor
 * @param {DynamoDB.DeleteItemInput} request
 * @param {DynamoDB.DeleteItemOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);
  return {
    common: commonResponse,
    tables: [{
      tableName: request.TableName,
      sentCount: 0,
      receivedCount: 0,
      processedCount: 1,
      consumedCapacity: response.ConsumedCapacity,
    }],
  };
};
