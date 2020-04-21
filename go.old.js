import Departments from './routes/departments.js';
import Products from './routes/products.js';
import Suppliers from './routes/suppliers.js';

let NO_OUTPUT = false;
for (const arg of process.argv) {
  if (arg === '--no-output') NO_OUTPUT = true;
}

const allTestProducts = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
  '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32',
  '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47',
  '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '63',
  '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78',
  '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93',
  '94', '95', '96', '97', '98', '99', '100', '102', '103', '104', '105', '106', '107', '108',
  '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121',
  '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134',
  '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147',
  '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160',
  '161', '162', '163', '164', '165', '166', '167', '168', '169', '171', '172', '173', '174',
  '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187',
  '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(arr, max) {
  const scopedMax = getRandomInt(2, max);
  const selectedItems = new Set();
  for (let i = 0; i < scopedMax; i += 1) {
    const selectedEl = arr[getRandomInt(0, arr.length - 1)];
    selectedItems.add(selectedEl);
  }
  return Array.from(selectedItems);
}

function randomProductsTypes(products) {
  const productsTypes = {};
  for (const productId of products) {
    const types = new Set();
    for (let j = 0; j < 4; j += 1) {
      types.add(getRandomInt(1, 4));
    }
    productsTypes[productId] = Array.from(types).join(',');
  }
  return productsTypes;
}

const wayThroughApi = [
  Departments.getTopSuppliers,
  Products.getProducts,
  Departments.getDepartments,
  Products.getProducts.bind(null, {
    ids: randomArray(allTestProducts, 15),
  }),
  Departments.getDepartments,
  Products.getTypesByProducts.bind(null, {
    products: randomArray(allTestProducts, 15),
  }),
  Suppliers.getProductsBySuppliers.bind(null, randomProductsTypes(
    randomArray(allTestProducts, 8),
  )),
  Suppliers.getSuppliers,
];

const setTimer = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

wayThroughApi.reduce(async (promise, method) => {
  const prevResults = await promise;
  const result = await method();
  prevResults.push(result);

  await setTimer(1000);

  return prevResults;
}, Promise.resolve([]))
  .then((results) => {
    if (!NO_OUTPUT) {
      results.forEach((result) => {
        // eslint-disable-next-line no-console
        console.info(JSON.stringify(result));
      });
    }
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
