const Rate = require('../types/rate');

/**
 * @memberOf module:Dymon
 */
class BaseChannel {
  constructor(props) {
    /** @type module:Dymon.Rate */
    this.rate = new Rate(props.rate);
  }

  checkBusy() {
    const {
      rate,
      rate: {
        hasDebounceTime,
        hasRateSize,
      },
    } = this;

    if (!hasDebounceTime && !hasRateSize) return false;

    const timerStarted = rate.timer > 0;
    const rateSizeNotExceeded = rate.calls < rate.size;

    if (hasDebounceTime && hasRateSize) {
      return timerStarted && rateSizeNotExceeded;
    }
    return (hasDebounceTime && timerStarted) || (hasRateSize && rateSizeNotExceeded);
  }

  requestAccess() {
    const {
      rate,
      rate: {
        hasDebounceTime,
      },
    } = this;

    const allowedToWrite = !this.checkBusy();

    if (allowedToWrite) {
      rate.reset();

      // Setting timer
      if (hasDebounceTime) {
        rate.timer = setTimeout(() => {
          rate.timer = 0;
        }, rate.debounceTime);
      }
    }

    rate.calls += 1;

    return allowedToWrite;
  }

  // eslint-disable-next-line class-methods-use-this
  async send() {
    // will be overwritten
  }

  /**
   * Sends error to StatsD channel
   * @async
   * @param {object} request
   * @param {Error} error
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async error(request, error) {
    // will be overwritten
  }

  // eslint-disable-next-line class-methods-use-this
  close() {
    // will be overwritten
  }
}

module.exports = BaseChannel;
