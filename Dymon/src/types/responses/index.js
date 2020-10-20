const batchGetItem = require('./batchGetItem.js');
const batchWriteItem = require('./batchWriteItem.js');
const deleteItem = require('./deleteItem.js');
const getItem = require('./getItem.js');
const putItem = require('./putItem.js');
const query = require('./query.js');
const scan = require('./scan.js');
const transactGetItems = require('./transactGetItems.js');
const transactWriteItems = require('./transactWriteItems.js');
const updateItem = require('./updateItem.js');

/**
 * @type {Object.<string, function(Object):module:Dymon.Output>}
 * */
module.exports = {
  batchGetItem,
  batchWriteItem,
  deleteItem,
  getItem,
  putItem,
  query,
  scan,
  transactGetItems,
  transactWriteItems,
  updateItem,
};
