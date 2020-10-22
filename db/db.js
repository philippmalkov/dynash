require('../dotenv'); // eslint-disable-line import/order

const DynamoDB = require('aws-sdk/clients/dynamodb');
const { Dymon, StatsDChannel } = require('dymon');
const dy2json = require('./dy2json');

const DB = new DynamoDB({
  apiVersion: '2012-08-10',
  endpoint: process.env.AWS_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const dymon = new Dymon({
  full: true,
  outputChannels: [new StatsDChannel({})],
});

dymon.patchDynamo(DB);

DB.dy2json = dy2json;

module.exports = DB;
