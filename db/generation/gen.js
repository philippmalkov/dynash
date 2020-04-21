const lo = require('lodash');

const {
  getRandomInt,
  getRandomFromArray,
  UniqueList,
  UniqueUUID,
  d2c,
} = require('./tools');

const names = require('./constants/names');
const addresses = require('./constants/addresses');
const phoneNumbers = require('./constants/phoneNumbers');

function gen() {
  const numberOfDepartments = getRandomInt(3, 6);
  const numberOfProducts = getRandomInt(100, 500);
  const numberOfSuppliers = getRandomInt(100, 500);

  const departments = lo
    .range(1, numberOfDepartments + 1)
    .map(id => ({
      id,
      name: `Department ${id}`,
      shortName: `Dep. ${id}`,
    }));

  const productIds = UniqueUUID();

  const products = lo
    .range(1, numberOfProducts + 1)
    .map(() => {
      const id = productIds.next().value;

      return {
        id,
        title: `Item#${id}`,
        price: getRandomInt(d2c(30), d2c(6000)),
        departmentId: getRandomFromArray(departments).id,
      };
    });

  const uniqueAddresses = UniqueList(addresses);
  const uniquePhoneNumbers = UniqueList(phoneNumbers);

  const supplierIds = UniqueUUID();

  const suppliers = lo
    .range(1, numberOfSuppliers + 1)
    .map(() => ({
      id: supplierIds.next().value,
      name: `${getRandomFromArray(names.names)} ${getRandomFromArray(names.surnames)}`,
      address: uniqueAddresses.next().value,
      phoneNumber: uniquePhoneNumbers.next().value,
    }));

  const suppliersProducts = lo.chain(suppliers)
    .map((supplier) => {
      const supplierProducts = UniqueList(products);

      return lo
        .range(0, getRandomInt(0, Math.trunc(products.length * 0.75)))
        .map(() => {
          const product = supplierProducts.next().value;

          return {
            productId: product.id,
            supplierId: supplier.id,
            price: getRandomInt(product.price, product.price + d2c(50)),
            quantity: getRandomInt(5, 600000),
          };
        });
    })
    .flatten()
    .value();

  let Departments = departments.map(dep => ({
    Id: { N: dep.id.toString() },
    Name: { S: dep.name },
    ShortName: { S: dep.shortName },
  }));

  let Products = products.map(product => ({
    Id: { S: product.id },
    Title: { S: product.title },
    Price: { N: product.price.toString() },
    DepartmentId: { N: product.departmentId.toString() },
  }));

  let Suppliers = suppliers.map(supplier => ({
    Id: { S: supplier.id },
    Name: { S: supplier.name },
    Address: { S: supplier.address },
    PhoneNumber: { S: supplier.phoneNumber },
  }));

  let SuppliersProducts = suppliersProducts.map(product => ({
    ProductId: { S: product.productId },
    SupplierId: { S: product.supplierId },
    Price: { S: product.price.toString() },
    Quantity: { N: product.quantity.toString() },
  }));

  [Departments, Products, Suppliers, SuppliersProducts] = (
    [Departments, Products, Suppliers, SuppliersProducts]
      .map(
        records => records.map(record => ({ PutRequest: { Item: record } })),
      )
  );

  return {
    Department: Departments,
    Product: Products,
    Supplier: Suppliers,
    SupplierProduct: SuppliersProducts,
  };
}

module.exports = gen;
