const debug = require("debug")("evolvus-application.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/applicationSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("application", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const applicationTestData = require("./applicationTestData");
const application = require("../index");

const tenantOne = "T001";
const tenantTwo = "T002";
describe('application model validation', () => {
  let applicationObject = {
    "tenantId": "IVL",
    "applicationName": "Dockets",
    "applicationCode": "DOCKETs",
    "createdBy": "Srihari",
    "createdDate": new Date()
      .toISOString(),
    "enableFlag": "1",
    "logo": "",
    "favicon": "",
    "description": "This is application object",
    "updatedBy": "Srihari",
    "lastupdatedDate": new Date()
      .toISOString(),
  };

  let invalidObject = {

    applicationName: "Docket",
    createdBy: "Kavya",
    createdDate: new Date()
      .toISOString(),
    enableFlag: false
  };

  let undefinedObject;
  let nullObject = null;


  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

});