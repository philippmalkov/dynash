/* eslint-disable no-use-before-define */

const DynamoType = {
  number: 'N',
  base64bin: 'B',
  numberSet: 'NS',
  binSet: 'BS',
  stringSet: 'SS',
  list: 'L',
  map: 'M',
  string: 'S',
  bool: 'BOOL',
  null: 'NULL',
};

function dy2json(dynJson) {
  if (Array.isArray(dynJson)) {
    return dynJson.map(typedObject => typedObjectToJson(typedObject));
  }

  return typedObjectToJson(dynJson);
}

class AttributeObject extends Object {
  constructor(type, value) {
    super();

    this.type = type;
    this.value = value;
  }

  static fromJson(jsonObject) {
    const [type, value] = Object.entries(jsonObject)[0];

    return new AttributeObject(type, value);
  }
}

function typedArrayToJson(typedArray) {
  return typedArray
    .map(attributeObject => convertType(AttributeObject.fromJson(attributeObject)));
}

function singleTypedArrayToJson(type, singleTypedArray) {
  return singleTypedArray.map((attributeValue) => {
    const attributeObject = new AttributeObject(type, attributeValue);
    return convertType(attributeObject);
  });
}

function typedObjectToJson(typedObject) {
  return Object.entries(typedObject)
    .reduce((mapObject, [key, value]) => {
      mapObject[key] = convertType(AttributeObject.fromJson(value));

      return mapObject;
    }, {});
}

function convertType(attributeObject) {
  switch (attributeObject.type) {
    case DynamoType.number: // Number
      return Number(attributeObject.value);
    case DynamoType.numberSet: // Number Set
      return singleTypedArrayToJson(DynamoType.number, attributeObject.value);
    case DynamoType.base64bin: // Binary base64 string
      return Buffer.from(attributeObject.value, 'base64');
    case DynamoType.binSet: // Binary Set
      return singleTypedArrayToJson(DynamoType.base64bin, attributeObject.value);
    case DynamoType.stringSet: // String Set
      return singleTypedArrayToJson(DynamoType.string, attributeObject.value);
    case DynamoType.list: // List
      return typedArrayToJson(attributeObject.value);
    case DynamoType.map: // Map
      return typedObjectToJson(attributeObject.value);
    case DynamoType.string: // String
    case DynamoType.bool: // Boolean
      return attributeObject.value;
    case DynamoType.null:
      return null;
    default:
      return '<UNKNOWN>';
  }
}

module.exports = dy2json;
