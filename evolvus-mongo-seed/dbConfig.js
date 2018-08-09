const path = require('path');

const dir = process.env.SCRIPT_HOME || '/home/vigneshp/Documents/SA/Script';

module.exports.config = {
  database: {
    protocol: 'mongodb',
    host: 'localhost',
    port: 27017,
    name: 'PlatformRelease_Test',
    username: undefined,
    password: undefined
  },
  //databaseConnectionUri: MONGO_DB_URL, // if defined, it will be used for DB connection instead of `database` object
  dropCollection: false, // drops every collection that is being imported
  inputPath: dir, //path.resolve(__dirname, 'output'), // input directory with import data structure
  dropDatabase: true, // drops database before import
  replaceIdWithUnderscoreId: false, // rewrites `id` property to `_id` for every document; useful for ORMs
  supportedExtensions: ['json', 'js'], // file extensions that should be read
  reconnectTimeoutInSeconds: 120 // maximum time of waiting for successful connection with MongoDB
};