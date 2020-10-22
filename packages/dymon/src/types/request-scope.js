const Responses = require('./responses');
const AllowedMethods = require('../constants/AllowedMethods');

class RequestScope {
  /**
   * Stores scoped request data
   * @param {string} caller
   * @param {object} request
   * @param {module:Dymon.BaseChannel[]} outputChannels
   */
  constructor({ caller, request, outputChannels }) {
    if (!AllowedMethods.all.has(caller)) {
      throw new Error(`'${caller}' method is not allowed.`);
    }
    this.caller = caller;
    this.request = request;
    this.outputChannels = outputChannels;
  }

  /**
   * @param {Object} response
   */
  registerResponse(response) {
    const { caller, request } = this;

    const output = Responses[caller](request, response);

    return Promise.all(
      this.outputChannels.map(outputChannel => outputChannel.send(output)),
    ).catch(err => console.warn('WARN! Error in StatsD channel:', err)); // eslint-disable-line no-console
  }

  /**
   * @param {Error} error
   */
  registerError(error) {
    const { request } = this;

    return Promise.all(
      this.outputChannels.map(outputChannel => outputChannel.error(request, error)),
    ).catch(err => console.warn('WARN! Error in StatsD channel:', err)); // eslint-disable-line no-console
  }
}

module.exports = RequestScope;
