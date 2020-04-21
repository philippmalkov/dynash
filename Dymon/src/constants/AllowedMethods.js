const single = new Set([
  'deleteItem',
  'getItem',
  'putItem',
  'query',
  'scan',
  'updateItem',
]);

const batch = new Set([
  'batchGetItem',
  'batchWriteItem',
  'transactGetItems',
  'transactWriteItems',
]);

const all = new Set([...single, ...batch]);

module.exports = {
  single,
  batch,
  all,
};
