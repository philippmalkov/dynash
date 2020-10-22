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

async function go() {
  const allDepartments = await db.scan({ TableName: 'Department' }).promise();
  const allProducts = await db.scan({ TableName: 'Product' }).promise();
  const allSuppliers = await db.scan({ TableName: 'Supplier' }).promise();
  const allSuppliersProducts = await db.scan({ TableName: 'SupplierProduct' }).promise();

  console.info(
    'We have '
    + `${allDepartments.Items.length} departments, `
    + `${allProducts.Items.length} products, `
    + `${allSuppliers.Items.length} suppliers, `
    + `${allSuppliersProducts.Items.length} suppliers products.`,
  );

  const productToDelete = tools.getRandomFromArray(allProducts.Items);

  console.log(`Deleting #${productToDelete.Id.S} product...`);
  await deleteProduct(productToDelete);
  console.log(`#${productToDelete.Id.S} product is deleted.`);

  console.log(`Putting #${productToDelete.Id.S} product back...`);
  await putProduct(productToDelete);
  console.log(`${productToDelete.Id.S} product is put.`);

  console.log(`Requesting #${productToDelete.Id.S} product...`);
  await getProduct(productToDelete);
  console.log(`#${productToDelete.Id.S} product is received.`);

  console.log(`Requesting #${productToDelete.Id.S} product suppliers...`);
  const queriedProductSuppliers = (await getProductSuppliers(productToDelete)).Items.slice(0, 100);
  console.log(`#${productToDelete.Id.S} product suppliers are received.`);

  console.log(`Requesting #${productToDelete.Id.S} product suppliers details...`);
  const suppliersBG = await batchGetSuppliers(
    queriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product supplier details are received.`);

  console.log(`Deleting #${productToDelete.Id.S} product suppliers...`);
  await batchDeleteSuppliers(
    queriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product suppliers are deleted.`);

  console.log('Putting deleted suppliers back...');
  await batchWriteSuppliers(suppliersBG.Responses.Supplier);
  console.log('Deleted suppliers are wrote to database.');

  console.log(`Requesting #${productToDelete.Id.S} product suppliers via transaction...`);
  await getSuppliersViaTransaction(
    queriedProductSuppliers.map(i => i.SupplierId.S),
  );
  console.log(`#${productToDelete.Id.S} product suppliers are received.`);

  const numberOfProductsToUpdate = 61;

  console.log(`Updating ${numberOfProductsToUpdate} random products via transaction...`);
  await updateProductsViaTransaction(allProducts, numberOfProductsToUpdate);
  console.log(`${numberOfProductsToUpdate} random products are updated.`);

  const randomSupplierName = tools.getRandomFromArray(allSuppliers.Items).Name.S;
  const first3Letters = randomSupplierName.slice(0, 3);

  console.log(`Searching for supplier who's name begins with '${first3Letters}' letters...`);
  const scannedSuppliers = await scanSuppliersByNameBeginning(allSuppliers, first3Letters);
  console.log(`Suppliers with ${scannedSuppliers.Items.map(s => `'${s.Name.S}'`).join(', ')} names are received.`);

  const randomProduct = tools.getRandomFromArray(allProducts.Items);

  console.log(`Updating #${randomProduct.Id.S} product...`);
  const updatedProduct = await updateProduct(randomProduct);
  console.log(`#${randomProduct.Id.S} product are updated: its Price set from ${randomProduct.Price.N} to ${updatedProduct.Attributes.Price.N} cents...`);
}

function main() {
  go()
    .catch((err) => {
      console.error('An unexpected error occurred while going through the way:', err);
    })
    .finally(() => {
      const msToWait = tools.getRandomFromArray([
        300, // 300ms
        500, // 500ms
        800, // 800ms
        1000, // 1s
        3 * 1000, // 3s
        5 * 1000, // 5s
        10 * 1000, // 10s
        60 * 1000, // 1m
        1.5 * 60 * 1000, // 1.5m
        2 * 60 * 1000, // 2m
      ]);

      console.log('\nWaiting for', msToWait, 'ms...\n');

      setTimeout(main, msToWait);
    });
}

main();
