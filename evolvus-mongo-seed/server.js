const fs = require('fs');
var shell = require('shelljs');
const context = require('./context');

const {
  seedDatabase
} = require('mongo-seeding');
const path = require('path');
const fileConfig = require('./fileConfig');

fileConfig.configure.forEach(file => {

  shell.exec(`velocity -t ${file.template} -c ${file.context} -o ${file.output}`);


});

//const MONGO_DB_URL = process.env.MONGO_DB_URL | 'mongodb://192.168.1.17:27017/seedVigneshDatabase'
//192.168.1.17
const config = {
  database: {
    protocol: 'mongodb',
    host: '10.10.69.204',
    port: 27017,
    name: 'seedVigneshDatabase',
    username: undefined,
    password: undefined
  },
  //databaseConnectionUri: MONGO_DB_URL, // if defined, it will be used for DB connection instead of `database` object
  dropCollection: false, // drops every collection that is being imported
  inputPath: path.resolve(__dirname, 'output'), // input directory with import data structure
  dropDatabase: true, // drops database before import
  replaceIdWithUnderscoreId: false, // rewrites `id` property to `_id` for every document; useful for ORMs
  supportedExtensions: ['json', 'js'], // file extensions that should be read
  reconnectTimeoutInSeconds: 10 // maximum time of waiting for successful connection with MongoDB
};


seedDatabase(config).then(() => {
  console.log("success");
}).catch(err => {
  console.log("ERROR :", err);
});