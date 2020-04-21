/* eslint-disable no-use-before-define */

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
    case 'N': // Number
      return Number(attributeObject.value);
    case 'NS': // Number Set
      return singleTypedArrayToJson('N', attributeObject.value);
    case 'B': // Binary base64 string
      return Buffer.from(attributeObject.value, 'base64');
    case 'BS': // Binary Set
      return singleTypedArrayToJson('B', attributeObject.value);
    case 'SS': // String Set
      return singleTypedArrayToJson('S', attributeObject.value);
    case 'L': // List
      return typedArrayToJson(attributeObject.value);
    case 'M': // Map
      return typedObjectToJson(attributeObject.value);
    case 'S': // String
    case 'BOOL': // Boolean
      return attributeObject.value;
    case 'NULL':
      return null;
    default:
      return 'unknown';
  }
}

function Dy2Json(dynJson) {
  if (Array.isArray(dynJson)) {
    return dynJson.map((typedObject) => {
      const jsonObject = typedObjectToJson(typedObject);
      return jsonObject;
    });
  }

  return typedObjectToJson(dynJson);
}

module.exports = Dy2Json;
