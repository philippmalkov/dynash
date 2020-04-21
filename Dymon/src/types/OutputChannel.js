const StatsD = require('hot-shots');
const lo = require('lodash');
const Rate = require('./Rate');

/**
 * @class module:Dymon.OutputChannel
 */
class OutputChannel {
  constructor(props) {
    this.rate = new Rate(props.rate);

    this.client = new StatsD({
      prefix: 'dyn_',
      telegraf: true,
      globalTags: { env: process.env.NODE_ENV },
      errorHandler: err => this.errorHandler(err),
      protocol: 'tcp',
    });
  }

  errorHandler(err) {
    this.zclient = this.client;
    console.error(err);
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

  /**
   * Sends output to StatsD channel
   * @async
   * @param {module:Dymon.Output} output
   * @returns {Promise<void>}
   */
  async send(output) {
    const { common, tables } = output;

    console.info('Common output:');
    console.dir(common);
    tables.forEach((table) => {
      console.info(`Table ${table.tableName} output:`);
      console.dir(table);
    });

    await this.timing('invocations', 1, {
      operation: common.operation,
    });
    await this.timing('httpRetries', common.retryCount, {
      operation: common.operation,
    });
    await this.timing('duration', common.runTime, {
      operation: common.operation,
    });
    await this.timing('size', common.inputSize, {
      type: 'input',
      operation: common.operation,
    });
    await this.timing('size', common.outputSize, {
      type: 'output',
      operation: common.operation,
    });

    await Promise.all(
      output.tables.map(tableOutput => Promise.all([
        this.timing('quantities', tableOutput.sentCount, {
          type: 'sentCount',
          operation: common.operation,
          tableName: tableOutput.tableName,
        }),
        this.timing('quantities', tableOutput.receivedCount, {
          type: 'receivedCount',
          operation: common.operation,
          tableName: tableOutput.tableName,
        }),
        this.timing('quantities', tableOutput.processedCount, {
          type: 'processedCount',
          operation: common.operation,
          tableName: tableOutput.tableName,
        }),

        this.timing('ccu', tableOutput.consumedCapacity.CapacityUnits, {
          type: 'total',
          indexName: '<TOTAL>',
          operation: common.operation,
          tableName: tableOutput.tableName,
        }),
        this.timing('ccu', lo.get(tableOutput.consumedCapacity.Table, 'CapacityUnits', 0), {
          type: 'table',
          indexName: '<TOTAL>',
          operation: common.operation,
          tableName: tableOutput.tableName,
        }),
        tableOutput.consumedCapacity.LocalSecondaryIndexes ? (
          Promise.all(
            lo.map(
              tableOutput.consumedCapacity.LocalSecondaryIndexes,
              (localIndexCCU, indexName) => this.timing('ccu', lo.get(localIndexCCU, 'CapacityUnits', 0), {
                type: 'localIndex',
                indexName,
                operation: common.operation,
                tableName: tableOutput.tableName,
              }),
            ),
          )
        ) : null,
        tableOutput.consumedCapacity.GlobalSecondaryIndexes ? (
          Promise.all(
            lo.map(
              tableOutput.consumedCapacity.GlobalSecondaryIndexes,
              (globalIndexCCU, indexName) => this.timing('ccu', lo.get(globalIndexCCU, 'CapacityUnits', 0), {
                type: 'globalIndex',
                indexName,
                operation: common.operation,
                tableName: tableOutput.tableName,
              }),
            ),
          )
        ) : null,
      ])),
    );

    console.log('Received output is registered in StatsD.');
  }

  /**
   * Closes the output channel
   * @async
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this.client.close((err) => {
        if (err) reject(err);
        resolve();
        console.log('Connection with StatsD is closed.');
      });
    });
  }

  increment(...args) {
    return new Promise((resolve, reject) => {
      this.client.increment(...args, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(err);
      });
    });
  }

  timing(...args) {
    return new Promise((resolve, reject) => {
      this.client.timing(...args, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(err);
      });
    });
  }
}

module.exports = OutputChannel;
