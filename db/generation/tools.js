const fs = require('fs').promises;
const path = require('path');
const lo = require('lodash');
const { v4: uuid4 } = require('uuid');

const { tables: tableNames, outputDirectory } = require('./constants/common');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFromArray(array) {
  return array[getRandomInt(0, array.length - 1)];
}

function* UniqueList(list) {
  const uniqueList = list.slice(0);

  while (uniqueList.length) {
    const uniqueIdx = getRandomInt(0, uniqueList.length - 1);
    const uniqueEl = uniqueList[uniqueIdx];
    uniqueList.splice(uniqueIdx, 1);
    yield uniqueEl;
  }
}

function* UniqueUUID(length = 6) {
  const uniqueSet = new Set();

  while (true) {
    let unique = null;
    while (!unique || uniqueSet.has(unique)) {
      unique = (uuid4() || '').slice(-length);
    }
    uniqueSet.add(unique);
    yield unique;
  }
}

function d2c(dollars) {
  return dollars * 100;
}

async function getCachedFilesNames() {
  const generatedFiles = await fs.readdir(outputDirectory);

  return lo.chain(generatedFiles)
    .map((filename) => {
      const matchedFormat = filename.match(/^(\w+)\.part-(\d+)\.json$/);

      if (!matchedFormat) return null;
      return {
        tableName: matchedFormat[1],
        number: Number(matchedFormat[2]),
        filename,
      };
    })
    .filter(filename => !!filename)
    .value();
}

async function loadCache() {
  const cachedFiles = await getCachedFilesNames();
  const cachedFilesGByTableName = lo.groupBy(cachedFiles, 'tableName');

  const tables = await Promise.all(
    tableNames.map((tableName) => {
      const tableFiles = cachedFilesGByTableName[tableName]
        .sort((l, r) => l.number - r.number);

      return Promise.all(
        tableFiles.map(
          file => fs.readFile(path.resolve(outputDirectory, file.filename))
            .then(data => JSON.parse(data.toString())),
        ),
      );
    }),
  );

  return lo.chain(tables)
    .map((tableRecordsParts, idx) => {
      const tableName = tableNames[idx];
      return lo.flatten(tableRecordsParts.map(part => part[tableName]));
    })
    .value();
}

module.exports = {
  getRandomInt,
  getRandomFromArray,
  UniqueList,
  UniqueUUID,
  d2c,
  getCachedFilesNames,
  loadCache,
};
