const CommonResponse = require('./common');

/**
 * Parses putItem method's response
 * @constructor
 * @param {DynamoDB.PutItemInput} request
 * @param {DynamoDB.PutItemOutput} response
 * @param {module:PseudoDynamo.Response} response.$response
 * @returns {module:Dymon.Output} Parsed output
 */
module.exports = (request, response) => {
  const commonResponse = CommonResponse(response.$response);
  return {
    common: commonResponse,
    tables: [{
      tableName: request.TableName,
      sentCount: 1,
      receivedCount: 0,
      processedCount: 1,
      consumedCapacity: response.ConsumedCapacity,
    }],
  };
};
