const debug = require("debug")("evolvus-masterCurrency.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const masterCurrency = require("../index");

const masterCurrencyTestData = require("./masterCurrencyTestData");

const tenantOne = "IVL";
const tenantTwo = false "KOT";
describe('masterCurrency model validation', () => {
  let masterCurrencyObject = {
    "tenantId": "IVL",
    "wfInstanceStatus": "wfStatus",
    "entityCode": "entity1",
    "currencyCode": "DZD",
    "currencyName": "Algerian dinar",
    "decimalDigit": "2",
    "delimiter": "12",
    "createdBy": "SYSTEM",
    "updatedBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "objVersion": 123,
    "enableFlag": "1",
    "currencyLocale": "local",
  };

  let invalidObject = {

    "tenantId": "IVL",
    "currencyName": "Algerian dinar",
    "decimalDigit": "",
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

  describe("validation against jsonschema", () => {
    it("valid masterCurrency should validate successfully", (done) => {
      try {
        var res = masterCurrency.validate(tenantOne, masterCurrencyObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);

      } catch (e) {
        expect.fail(e, null, `valid masterCurrency object should not throw exception: ${e}`);
      }
    });

    it("invalid masterCurrency should return errors", (done) => {
      try {
        var res = masterCurrency.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if ("should error out for undefined objects", (done) => {
        try {
          var res = masterCurrency.validate(undefinedObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

    if ("should error out for null objects", (done) => {
        try {
          var res = masterCurrency.validate(nullObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

  });
});