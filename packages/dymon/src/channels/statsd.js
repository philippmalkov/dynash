const StatsD = require('hot-shots');
const lo = require('lodash');
const BaseChannel = require('./base');

class StatsDChannel extends BaseChannel {
  constructor(props) {
    super(props);

    this.client = new StatsD({
      prefix: 'dyn_',
      telegraf: true,
      globalTags: { env: process.env.NODE_ENV },
      protocol: 'udp',
    });
  }

  /**
   * Sends output to StatsD channel
   * @async
   * @param {module:Dymon.Output} output
   * @returns {Promise<void>}
   */
  async send(output) {
    const { common } = output;

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
          indexName: '<TABLE>',
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
  }

  async error(request) {
    const { operation } = request;

    await this.timing('httpRetries', 1, {
      operation,
    });
  }

  /**
   * Closes the output channel
   * @async
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this.client.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
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

module.exports = StatsDChannel;
