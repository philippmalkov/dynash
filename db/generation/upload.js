/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const lo = require('lodash');

const gen = require('./gen');
const tools = require('./tools');
const { tables: tableNames, outputDirectory } = require('./constants/common');

const Dynamo = require('../db');

const inputInterval = Number(process.argv[2]);
const INTERVAL_DURATION = Number.isNaN(inputInterval) || inputInterval < 0 ? 1000 : inputInterval;

console.info('Interval is set to:', INTERVAL_DURATION);

(async () => {
  try {
    await fs.mkdir(outputDirectory);
  } catch (err) {
    if (!err || !(err instanceof Error) || err.code !== 'EEXIST') {
      throw err;
    }
  }

  const cachedFiles = await tools.getCachedFilesNames();
  const cachedFilesGByTableName = lo.groupBy(cachedFiles, 'tableName');

  let fromCache = false;

  let tables;
  if (tableNames.every(tableName => cachedFilesGByTableName[tableName])) {
    console.info('Taking records from cache...');
    const recordsByTables = await tools.loadCache();

    tables = tableNames.map((tableName, idx) => [tableName, recordsByTables[idx]]);

    fromCache = true;
    console.info('Cached records are taken.');
  } else {
    console.info('Cleaning generated files...');
    await Promise.all(
      cachedFiles.map(
        file => fs.unlink(path.resolve(outputDirectory, file.filename)),
      ),
    );
    console.info('Cleaned.');

    console.info('Generating records...');
    const generated = gen();

    tables = tableNames.map(tableName => [tableName, generated[tableName]]);
    console.info('The records are generated.');
  }

  const recordsSplitSize = 25;

  let tableIdx = 0;
  /* eslint-disable no-await-in-loop */
  tablesCycle: // eslint-disable-line no-labels, no-restricted-syntax
  for (const [tableName, tableRecords] of tables) {
    for (let leftSide = 0; leftSide < tableRecords.length; leftSide += recordsSplitSize) {
      const slicedRecords = tableRecords.slice(leftSide, leftSide + recordsSplitSize);

      const partNumber = (leftSide / recordsSplitSize) + 1;

      console.info(`Sending ${partNumber}th records of '${tableName}' table to Dynamo...`);
      try {
        await Dynamo.batchWriteItem({
          RequestItems: {
            [tableName]: slicedRecords,
          },
        }).promise();
      } catch (err) {
        console.error(
          `An error occurred while sending ${partNumber}th records of '${tableName}' table:\n`,
          err,
        );
        break tablesCycle; // eslint-disable-line no-labels
      }
      console.info(`${partNumber}th records of '${tableName}' table are saved.`);

      if (!fromCache) {
        console.info(`Saving ${partNumber}th records of '${tableName}' table to cache...`);
        try {
          await fs.writeFile(
            path.resolve(outputDirectory, `${tableName}.part-${partNumber}.json`),
            JSON.stringify({ [tableName]: slicedRecords }),
          );
        } catch (err) {
          console.error(
            `An error occurred while saving '${tableName}' table record to cache:\n`,
            err,
          );
          break tablesCycle; // eslint-disable-line no-labels
        }
        console.info(`${partNumber}th records of '${tableName}' table are saved.`);
      }

      if (tableIdx + 1 === tables.length && leftSide + recordsSplitSize > tableRecords.length) {
        // It was last sending
        console.info('All sent.');
        break tablesCycle; // eslint-disable-line no-labels
      }

      if (INTERVAL_DURATION) {
        console.info(`Waiting for ${INTERVAL_DURATION} ms...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL_DURATION));
      }
    }

    tableIdx += 1;
  }
  /* eslint-enable no-await-in-loop */
})()
  .catch((err) => {
    console.error('Unexpected error occurred while records uploading:', err);
  })
  .finally(() => process.exit(0));
