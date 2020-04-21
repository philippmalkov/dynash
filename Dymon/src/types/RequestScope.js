const Responses = require('./Responses');
const AllowedMethods = require('../constants/AllowedMethods');

class RequestScope {
  /**
   * Stores scoped request data
   * @param {string} caller
   * @param {Object} request
   * @param {module:Dymon.OutputChannel[]} outputChannels
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
    const output = Responses[this.caller](this.request, response);

    this.outputChannels.forEach((outputChannel) => {
      outputChannel.send(output)
        .catch((error) => {
          console.error('An error occurred while sending output:', error); // TODO: logger
        });
    });
  }
}

module.exports = RequestScope;
