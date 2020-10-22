const path = require('path');
const ENV = require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = ENV;
