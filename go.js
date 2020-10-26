const db = require('./db/db');
const tools = require('./db/generation/tools');

const deleteProduct = require('./db-queries/deleteProduct');
const putProduct = require('./db-queries/putProduct');
const getProduct = require('./db-queries/getProduct');
const getProductSuppliers = require('./db-queries/getProductSuppliers');
const batchGetSuppliers = require('./db-queries/batchGetSuppliers');
const batchDeleteSuppliers = require('./db-queries/batchDeleteSuppliers');
const batchWriteSuppliers = require('./db-queries/batchWriteSuppliers');
const getSuppliersViaTransaction = require('./db-queries/getSuppliersViaTransaction');
const updateProductsViaTransaction = require('./db-queries/updateProductsViaTransaction');
const scanSuppliersByNameBeginning = require('./db-queries/scanSuppliersByNameBeginning');
const updateProduct = require('./db-queries/updateProduct');

const globalCacheUpdateDurations = [10, 15, 20];

const setOfMiniDurations = [
  0,
  300, // 300ms
  500, // 500ms
  800, // 800ms
  1000, // 1s
  1.5 * 1000, // 1.5s
  3 * 1000, // 3s
  5 * 1000, // 5s
  10 * 1000, // 10s
];

const fullSetOfDurations = [
  ...setOfMiniDurations,
  30 * 1000, // 30s
  60 * 1000, // 1m
  1.5 * 60 * 1000, // 1.5m
  2 * 60 * 1000, // 2m
];

const GlobalCache = {
  departments: [],
  products: [],
  suppliers: [],
  suppliersProducts: [],
};

const waitFor = ms => new Promise((resolve) => {
  console.log('\nWaiting for', ms, 'ms...\n');

  setTimeout(resolve, ms);
});

async function go() {
  const productToDelete = tools.getRandomFromArray(GlobalCache.products.Items);

  console.log(`Deleting #${productToDelete.Id.S} product...`);
  await deleteProduct(productToDelete);
  console.log(`#${productToDelete.Id.S} product is deleted.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Putting #${productToDelete.Id.S} product back...`);
  await putProduct(productToDelete);
  console.log(`${productToDelete.Id.S} product is put.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Requesting #${productToDelete.Id.S} product...`);
  await getProduct(productToDelete);
  console.log(`#${productToDelete.Id.S} product is received.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Requesting #${productToDelete.Id.S} product suppliers...`);
  const queriedProductSuppliers = await getProductSuppliers(productToDelete);
  const partOfQueriedProductSuppliers = queriedProductSuppliers.Items
    .slice(0, tools.getRandomInt(8, Math.trunc(queriedProductSuppliers.Items.length * 0.8)));
  console.log(`#${productToDelete.Id.S} product suppliers are received.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Requesting #${productToDelete.Id.S} product suppliers details...`);
  const suppliersBG = await batchGetSuppliers(
    partOfQueriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product supplier details are received.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Deleting #${productToDelete.Id.S} product suppliers...`);
  await batchDeleteSuppliers(
    partOfQueriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product suppliers are deleted.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log('Putting deleted suppliers back...');
  await batchWriteSuppliers(suppliersBG.Responses.Supplier);
  console.log('Deleted suppliers are wrote to database.');

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  console.log(`Requesting #${productToDelete.Id.S} product suppliers via transaction...`);
  await getSuppliersViaTransaction(
    partOfQueriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product suppliers are received.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  const numberOfProductsToUpdate = tools.getRandomInt(5, 120);

  console.log(`Updating ${numberOfProductsToUpdate} random products via transaction...`);
  await updateProductsViaTransaction(GlobalCache.products, numberOfProductsToUpdate);
  console.log(`${numberOfProductsToUpdate} random products are updated.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  const randomSupplierName = tools.getRandomFromArray(GlobalCache.suppliers.Items).Name.S;
  const first3Letters = randomSupplierName.slice(0, 3);

  console.log(`Searching for supplier who's name begins with '${first3Letters}' letters...`);
  const scannedSuppliers = await scanSuppliersByNameBeginning(GlobalCache.suppliers, first3Letters);
  console.log(`Suppliers with ${scannedSuppliers.Items.map(s => `'${s.Name.S}'`).join(', ')} names are received.`);

  await waitFor(tools.getRandomFromArray(setOfMiniDurations));

  const randomProduct = tools.getRandomFromArray(GlobalCache.products.Items);

  console.log(`Updating #${randomProduct.Id.S} product...`);
  const updatedProduct = await updateProduct(randomProduct);
  console.log(
    `#${randomProduct.Id.S} product are updated: its Price set `
      + `from ${randomProduct.Price.N} to ${updatedProduct.Attributes.Price.N} cents...`,
  );
}

(async () => {
  await updateGlobalCache();

  let i = 0;
  /* eslint-disable no-await-in-loop, no-constant-condition */
  // noinspection InfiniteLoopJS
  while (true) {
    try {
      await go();
    } catch (err) {
      console.error('An unexpected error occurred while going through the way:', err);
    } finally {
      i += 1;
      if (i % tools.getRandomFromArray(globalCacheUpdateDurations) === 0) {
        await updateGlobalCache();
      }

      const msToWait = tools.getRandomFromArray(fullSetOfDurations);

      await waitFor(msToWait);
    }
  }
  /* eslint-enable no-await-in-loop, no-constant-condition */
})();

async function updateGlobalCache() {
  GlobalCache.departments = await db.scan({ TableName: 'Department' }).promise();
  GlobalCache.products = await db.scan({ TableName: 'Product' }).promise();
  GlobalCache.suppliers = await db.scan({ TableName: 'Supplier' }).promise();
  GlobalCache.suppliersProducts = await db.scan({ TableName: 'SupplierProduct' }).promise();

  console.info(
    'Global cache updated. We have: '
    + `${GlobalCache.departments.Items.length} departments, `
    + `${GlobalCache.products.Items.length} products, `
    + `${GlobalCache.suppliers.Items.length} suppliers, `
    + `${GlobalCache.suppliersProducts.Items.length} suppliers products.`,
  );
}
