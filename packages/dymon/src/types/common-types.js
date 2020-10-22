/**
 * @module Dymon
 */
/**
 * @typedef module:Dymon.CommonResponse
 * @property {string} requestId
 * @property {number} status
 * @property {number} retryCount
 * @property {number} runTime
 * @property {number} inputSize
 * @property {number} outputSize
 * @property {string} operation
 */
/**
 * @typedef module:Dymon.TableResponse
 * @property {string} tableName
 * @property {number} sentCount
 * @property {number} receivedCount
 * @property {number} processedCount
 * @property {DynamoDB.ConsumedCapacity} consumedCapacity
 */
/**
 * @typedef module:Dymon.Output
 * @property {module:Dymon.CommonResponse} common
 * @property {module:Dymon.TableResponse[]} tables
 */

/**
 * @module PseudoDynamo
 */
/**
 * @typedef module:PseudoDynamo.HttpRequest
 * @property {string} path
 * @property {string} search
 * @property {string} method
 * @property {Function<string>} pathname
 * @property {Object.<string, string>} headers
 * @property {string} body
 * @property {string} region
 */
/**
 * @typedef module:PseudoDynamo.HttpResponse
 * @property {number} statusCode
 * @property {string} statusMessage
 * @property {Object.<string, string>} headers
 * @property {(string|Buffer|Uint8Array)} body
 */
/**
 * @typedef module:PseudoDynamo.Request
 * @property {string} operation
 * @property {Date} startTime
 * @property {Object} params
 * @property {module:PseudoDynamo.HttpRequest} httpRequest
 */
/**
 * @typedef module:PseudoDynamo.Response
 * @property {module:PseudoDynamo.Request} request
 * @property {?Object} data
 * @property {?Error} error
 * @property {string} requestId
 * @property {number} retryCount
 * @property {number} redirectCount
 * @property {module:PseudoDynamo.HttpResponse} httpResponse
 */
