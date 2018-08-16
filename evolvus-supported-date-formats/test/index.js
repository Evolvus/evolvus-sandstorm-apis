const debug = require("debug")("evolvus-supportedDateFormats.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/supportedDateFormatsSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("supportedDateFormats", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Test_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const supportedDateFormatsTestData = require("./supportedDateFormatsTestData");
const supportedDateFormats = require("../index");

const tenantOne = "T001";
const tenantTwo = "T002";
describe('supportedDateFormats model validation', () => {
  let supportedDateFormatsObject = {
    "tenantId": "T001",
    "formatCode": "DD/MM/YYYY",
    "wfInstanceStatus": "wfStatus",
    "wfInstanceId": "wfID",
    "timeFormat": "hh:mm:ss",
    "description": "This is supportedDateFormats",
    "createdDate": new Date()
      .toISOString(),
    "lastUpdatedDate": new Date()
      .toISOString(),
    "createdBy": "SYSTEM",
    "updatedBy": "SYSTEM",
    "objVersion": 1,
    "enableFlag": "false"

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
    it("valid supportedDateFormats should validate successfully", (done) => {
      try {

        var res = supportedDateFormats.validate(supportedDateFormatsObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid supportedDateFormats object should not throw exception: ${e}`);
      }
    });

    it("invalid supportedDateFormats should return errors", (done) => {
      try {
        var res = supportedDateFormats.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for undefined objects", (done) => {
      try {
        var res = supportedDateFormats.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for null objects", (done) => {
      try {
        var res = supportedDateFormats.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing update supportedDateFormats", () => {
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
          return collection.save(_.merge(supportedDateFormatsTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });


    it('should update a supportedDateFormats with new values', (done) => {
      var res = supportedDateFormats.update(tenantOne, {}, {}, "DD/MM/YYYY", {
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "objVersion": 7,
        "enableFlag": "true"
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
      let res = supportedDateFormats.update(undefinedId, {}, {}, "DD/MM/YYYY", {
        "formatCode": "DD/MM/YYYY",
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = supportedDateFormats.update(tenantOne, {}, {}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = supportedDateFormats.update(tenantOne, {}, {}, "DD/MM/YYYY", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = supportedDateFormats.update(null, {}, {}, "DD/MM/YYYY", {
        formatCode: "DD/MM/YYYY"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = supportedDateFormats.update(tenantOne, {}, {}, null, {
        formatCode: "DD/MM/YYYY"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = supportedDateFormats.update(tenantOne, {}, {}, "DD/MM/YYYY", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
  //dbtesting
  describe("testing supportedDateFormats.save", () => {
    // Testing save
    // 1. Valid supportedDateFormats should be saved.
    // 2. Non supportedDateFormats object should not be saved.
    // 3. Should not save same supportedDateFormats twice.
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

    it("should fail saving invalid object to database", (done) => {
      // try to save an invalid object
      const invalidObject1 = supportedDateFormatsTestData.invalidObject1;
      let object = _.merge(invalidObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.be.eventually.rejectedWith("supportedDateFormats validation failed")
        .notify(done);
    });


    it("should fail saving duplicate object to database", (done) => {
      // save a valid object, then try to save another
      const validObject1 = supportedDateFormatsTestData.validObject1;
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

    it("should save valid supportedDateFormats to database", (done) => {
      const validObject1 = supportedDateFormatsTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });


    it("should save multple valid supportedDateFormats(s) to database", (done) => {
      const validObject1 = supportedDateFormatsTestData.validObject1;
      const validObject2 = supportedDateFormatsTestData.validObject2;
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

  describe("testing supportedDateFormats.find", () => {
    // Testing save
    // 1. Valid supportedDateFormats should be saved.
    // 2. Non supportedDateFormats object should not be saved.
    // 3. Should not save same supportedDateFormats twice.
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
          return collection.save(_.merge(supportedDateFormatsTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject4, {
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
        .to.eventually.have.lengthOf(4)
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
        "formatCode": "DD/MM/YYYY"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("formatCode")
            .to.equal("DD/MM/YYYY");
          done();
        });
    });

    it("should return ASBA, the first supportedDateFormats when sorted by supportedDateFormatsCode", (done) => {
      let res = collection.find({}, {
        "formatCode": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("formatCode")
            .to.equal('DD/MM/YYYY');
          done();
        });
    });

    it("should return Platform, the last supportedDateFormats when sorted by supportedDateFormatsCode", (done) => {
      let res = supportedDateFormats.find(tenantOne, {}, {}, {}, {
        "formatCode": -1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("formatCode")
            .to.equal('YYYY/MM/DD');
          done();
        });
    });

    it("should return 5 enabled supportedDateFormatss", (done) => {
      let res = supportedDateFormats.find(tenantOne, {}, {}, {
        "enableFlag": "false"
      }, {
        "formatCode": -1
      }, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app)
            .to.have.lengthOf(4);
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("formatCode")
            .to.equal('YYYY/MM/DD');
          expect(app[3])
            .to.have.property("formatCode")
            .to.equal('DD/MM/YYYY');
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
          return collection.save(_.merge(supportedDateFormatsTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(supportedDateFormatsTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should disable Platform supportedDateFormats", (done) => {
      let res = supportedDateFormats.update(tenantOne, {}, {}, "DD/MM/YYYY", {
        "updateBy": "system",
        "enableFlag": "true",
        "updatedDate": new Date()
          .toISOString(),
        "description": "Updated the supportedDateFormats at: " + Date.now()
      });
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app)
            .to.have.property("nModified")
            .to.equal(1);
          done();
          console.log(res, "response");
        });
    });
  });

});