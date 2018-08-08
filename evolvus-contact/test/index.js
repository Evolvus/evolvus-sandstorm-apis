const debug = require("debug")("evolvus-contact.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const contactTestData = require("./contactTestData");
const contact = require("../index");


const tenantOne = "IVL";
const tenantTwo = "KOT";

describe('contact model validation', () => {
  let contactObject = {
    "tenantId": "IVL",
    "firstName": "vignesh",
    "middleName": "varan",
    "lastName": "p",
    "emailId": "xyz@gmail.com",
    "emailVerified": true,
    "phoneNumber": "111111111",
    "mobileNumber": "2222222222222",
    "mobileVerified": true,
    "faxNumber": "02223",
    "companyName": "Evolvus",
    "address1": "Bangalore",
    "address2": "chennai",
    "city": "Bangalore",
    "state": "karnataka",
    "country": "India",
    "zipCode": "778899",
    "createdDate": new Date()
      .toISOString(),
    "lastUpdatedDate": new Date()
      .toISOString(),
  };

  let invalidObject = {

    "firstName": "yuvan",
    "phoneNumber": "78",
    "mobileNumber": "12",
    "mobileVerified": false
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