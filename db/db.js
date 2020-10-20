const DynamoDB = require('aws-sdk/clients/dynamodb');
const { Dymon, StatsDChannel } = require('dymon');
const dy2json = require('./dy2json');

const DB = new DynamoDB({
  apiVersion: '2012-08-10',
  credentials: {
    accessKeyId: 'AKIAZM7CQSNGXDQUY6PA',
    secretAccessKey: '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',
  },
  region: 'eu-central-1',
});

const dymon = new Dymon({
  full: true,
  outputChannels: [new StatsDChannel({})],
});

dymon.patchDynamo(DB);

DB.dy2json = dy2json;

module.exports = DB;
