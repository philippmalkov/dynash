const AllowedMethods = require('../constants/AllowedMethods');
const OutputChannel = require('./OutputChannel');

class DymonConfig {
  constructor(props = {}) {
    this.consumedCapacityType = props.full ? 'INDEXES' : 'TOTAL';
    this.trackedMethods = DymonConfig.parseTrackedMethods(props.trackedMethods);
    this.outputChannels = DymonConfig.parseOutputChannels(props.outputChannels);
  }

  static parseString(str) {
    if (typeof str !== 'string') return false;

    const outStr = str.trim();
    if (!outStr) return false;

    return outStr;
  }

  static parseTrackedMethods(rawMethods) {
    if (!rawMethods) return AllowedMethods.all;

    const trackedMethods = rawMethods.filter(rawMethod => AllowedMethods.all.has(rawMethod));

    if (trackedMethods.length === 0) {
      throw new Error('No methods for tracking passed.');
    }

    return trackedMethods;
  }

  static parseOutputChannels(rawOutputChannels = []) {
    return rawOutputChannels.map(rawOutputChannelProps => new OutputChannel(rawOutputChannelProps));
  }
}

module.exports = DymonConfig;
