const debug = require("debug")("evolvus-masterCurrency.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/masterCurrencySchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("masterCurrency", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Test_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const masterCurrencyTestData = require("./masterCurrencyTestData");
const masterCurrency = require("../index");

const tenantOne = "T001";
const tenantTwo = "T002";
describe('masterCurrency model validation', () => {
  let masterCurrencyObject = {

    "tenantId": "T001",
    "wfInstanceStatus": "wfStatus",
    "wfInstanceId": "wfID",
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
    "enableFlag": "false",
    "currencyLocale": "local",

  };

  let invalidObject = {

    "tenantId": "T001",
    "createdBy": "SYSTEM",
    "updatedBy": "SYSTEM"

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

        var res = masterCurrency.validate(masterCurrencyObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        console.log(e, "er");
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

    it("should error out for undefined objects", (done) => {
      try {
        var res = masterCurrency.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for null objects", (done) => {
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

  describe("testing update masterCurrency", () => {
    beforeEach((done) => {
      collection.deleteAll({
          tenantId: tenantOne
        })
        .then((value) => {
          return collection.deleteAll({
            tenantId: tenantTwo
          });
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });


    it('should update a masterCurrency with new values', (done) => {
      var res = masterCurrency.update(tenantOne, {}, {}, "DZD", {
        "enableFlag": "true",
        "currencyCode": "DZD",
        "currencyName": "Algerian dinar",
        "lastUpdatedDate": new Date()
          .toISOString(),
      });
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app)
            .to.have.property("nModified")
            .to.equal(1);
          done();
        });
    });
    it("should throw IllegalArgumentException for undefined tenantId parameter ", (done) => {
      let undefinedId;
      let res = masterCurrency.update(undefinedId, {}, {}, "DZD", {
        currencyName: "Algerian dinar"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = masterCurrency.update(tenantOne, {}, {}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = masterCurrency.update(tenantOne, {}, {}, "DZD", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterCurrency.update(null, {}, {}, "DOCKET", {
        masterCurrencyName: "DOCKET audit server"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterCurrency.update(tenantOne, {}, {}, null, {
        masterCurrencyName: "DOCKET"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterCurrency.update(tenantOne, {}, {}, "DZD", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
  //dbtesting
  describe("testing masterCurrency.save", () => {
    // Testing save
    // 1. Valid masterCurrency should be saved.
    // 2. Non masterCurrency object should not be saved.
    // 3. Should not save same masterCurrency twice.
    beforeEach((done) => {
      collection.deleteAll({
          "tenantId": tenantOne
        })
        .then((data) => {
          return collection.deleteAll({
            "tenantId": tenantTwo
          });
        })
        .then((data) => {
          done();
        });
    });

    // it("should fail saving invalid object to database", (done) => {
    //   // try to save an invalid object
    //   const invalidObject1 = masterCurrencyTestData.invalidObject1;
    //   let object = _.merge(invalidObject1, {
    //     "tenantId": tenantOne
    //   });
    //   let res = collection.save(object);
    //   expect(res)
    //     .to.be.eventually.rejectedWith("masterCurrency validation failed")
    //     .notify(done);
    // });


    it("should fail saving duplicate object to database", (done) => {
      // save a valid object, then try to save another
      const validObject1 = masterCurrencyTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      collection.save(object)
        .then((success) => {
          let res = collection.save(object);
          expect(res)
            .to.be.eventually.rejectedWith("duplicate")
            .notify(done);
        });
    });

    it("should save valid masterCurrency to database", (done) => {
      const validObject1 = masterCurrencyTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });


    it("should save multple valid masterCurrency(s) to database", (done) => {
      const validObject1 = masterCurrencyTestData.validObject1;
      const validObject2 = masterCurrencyTestData.validObject2;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      collection.save(object)
        .then((value) => {
          expect(value)
            .to.have.property("id");
          return collection.save(_.merge(validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          expect(value)
            .to.have.property("id");
          done();
        });
    });
  }); // testing save

  describe("testing masterCurrency.find", () => {
    // Testing save
    // 1. Valid masterCurrency should be saved.
    // 2. Non masterCurrency object should not be saved.
    // 3. Should not save same masterCurrency twice.
    beforeEach((done) => {
      //this.timeout(10000);
      collection.deleteAll({
          "tenantId": tenantOne
        })
        .then((value) => {
          return collection.deleteAll({
            "tenantId": tenantTwo
          });
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject5, {
            "tenantId": tenantOne
          }));
        })

        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject5, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should return all the values of a tenantOne", (done) => {
      let filter = {
        "tenantId": tenantOne
      };
      let res = collection.find(filter, {}, 0, 0);
      expect(res)
        .to.eventually.have.lengthOf(5)
        .notify(done);
    });

    it("should return a single value of a tenant", (done) => {
      let filter = {
        "tenantId": tenantOne
      };
      let res = collection.find(filter, {}, 0, 1);
      expect(res)
        .to.eventually.have.lengthOf(1)
        .notify(done);
    });

    it("should return a Platform object", (done) => {
      let res = collection.find({
        "currencyCode": "DZD"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("currencyCode")
            .to.equal("DZD");
          done();
        });
    });

    it("should return ASBA, the first masterCurrency when sorted by masterCurrencyCode", (done) => {
      let res = collection.find({}, {
        "currencyCode": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("currencyCode")
            .to.equal('CAD');
          done();
        });
    });

    it("should return Platform, the last masterCurrency when sorted by masterCurrencyCode", (done) => {
      let res = masterCurrency.find(tenantOne, {}, {}, {}, {
        "currencyCode": -1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("currencyCode")
            .to.equal('KWD');
          done();
        });
    });

    it("should return 5 enabled masterCurrencys", (done) => {
      let res = masterCurrency.find(tenantOne, {}, {}, {
        "enableFlag": "false"
      }, {
        "currencyCode": -1
      }, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app)
            .to.have.lengthOf(5);
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("currencyCode")
            .to.equal("KWD");
          expect(app[4])
            .to.have.property("currencyCode")
            .to.equal('CAD');
          done();
        });
    });

  }); // findAll testing

  describe("update testing", () => {
    beforeEach((done) => {
      collection.deleteAll({
          "tenantId": tenantOne
        })
        .then((value) => {
          return collection.deleteAll({
            "tenantId": tenantTwo
          });
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterCurrencyTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should disable Platform masterCurrency", (done) => {
      let res = masterCurrency.update(tenantOne, {}, {}, "DZD", {
        "enableFlag": "true",
        "updatedDate": new Date()
          .toISOString(),
        "description": "Updated the masterCurrency at: " + Date.now()
      });
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app)
            .to.have.property("nModified")
            .to.equal(1);
          done();
        });
    });
  });

});