const lo = require('lodash');

function getContentLengthFromHeaders(headers) {
  const contentLength = lo.find(headers, (i, k) => k.toLowerCase() === 'content-length');
  return Number(contentLength) || null;
}

function calcJSONSize(object) {
  const jsonStr = JSON.stringify(object);
  const m = encodeURIComponent(jsonStr).match(/%[89ABab]/g);
  return jsonStr.length + (m ? m.length : 0);
}

/**
 * Parses DynamoDB response
 * @function
 * @param {module:PseudoDynamo.Response} response
 * @returns {module:Dymon.CommonResponse}
 */
module.exports = response => ({
  requestId: response.requestId,
  status: response.httpResponse.statusCode,
  retryCount: response.retryCount,
  runTime: new Date() - response.request.startTime,
  inputSize: (
    getContentLengthFromHeaders(response.request.httpRequest.headers)
      || calcJSONSize(response.request.params)
  ),
  outputSize: (
    getContentLengthFromHeaders(response.httpResponse.headers)
      || calcJSONSize(response.data)
  ),
  operation: response.request.operation,
});
