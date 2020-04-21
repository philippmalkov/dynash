const CommonResponse = require('./common');

/**
 * Parses query method's response
 * @constructor
 * @param {DynamoDB.QueryInput} request
 * @param {DynamoDB.QueryOutput} response
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
      receivedCount: response.Count,
      processedCount: response.ScannedCount,
      consumedCapacity: response.ConsumedCapacity,
    }],
  };
};
