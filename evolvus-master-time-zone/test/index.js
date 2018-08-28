const debug = require("debug")("evolvus-masterTimeZone.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/masterTimeZoneSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("masterTimeZone", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Test_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const masterTimeZoneTestData = require("./masterTimeZoneTestData");
const masterTimeZone = require("../index");

const tenantOne = "T001";
const tenantTwo = "T002";
describe('masterTimeZone model validation', () => {
  let masterTimeZoneObject = {

    "tenantId": "T001",
    "wfInstanceStatus": "wfStatus",
    "wfInstanceId": "wfID",
    "zoneCode": "EAT",
    "zoneName": "Ethiopia",
    "offsetValue": "+03:00",
    "createdBy": "SYSTEM",
    "updatedBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "offSet": "UTC+03:00",
    "objVersion": 123,
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
    it("valid masterTimeZone should validate successfully", (done) => {
      try {

        var res = masterTimeZone.validate(masterTimeZoneObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid masterTimeZone object should not throw exception: ${e}`);
      }
    });

    it("invalid masterTimeZone should return errors", (done) => {
      try {
        var res = masterTimeZone.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for undefined objects", (done) => {
      try {
        var res = masterTimeZone.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for null objects", (done) => {
      try {
        var res = masterTimeZone.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing update masterTimeZone", () => {
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
          return collection.save(_.merge(masterTimeZoneTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });


    it('should update a masterTimeZone with new values', (done) => {
      var res = masterTimeZone.update(tenantOne, {}, {}, "IST", {
        "zoneCode": "IST",
        "zoneName": "ASIA",
        "offsetValue": "+05.30",
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
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
      let res = masterTimeZone.update(undefinedId, {}, {}, "IST", {
        "zoneName": "ASIA",
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = masterTimeZone.update(tenantOne, {}, {}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = masterTimeZone.update(tenantOne, {}, {}, "IST", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterTimeZone.update(null, {}, {}, "IST", {
        masterTimeZoneName: "DOCKET audit server"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterTimeZone.update(tenantOne, {}, {}, null, {
        zoneName: "ASIA"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = masterTimeZone.update(tenantOne, {}, {}, "IST", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
  //   //dbtesting
  describe("testing masterTimeZone.save", () => {
    // Testing save
    // 1. Valid masterTimeZone should be saved.
    // 2. Non masterTimeZone object should not be saved.
    // 3. Should not save same masterTimeZone twice.
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
      const invalidObject1 = masterTimeZoneTestData.invalidObject1;
      let object = _.merge(invalidObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.be.eventually.rejectedWith("masterTimeZone validation failed")
        .notify(done);
    });


    it("should fail saving duplicate object to database", (done) => {
      // save a valid object, then try to save another
      const validObject1 = masterTimeZoneTestData.validObject1;
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

    it("should save valid masterTimeZone to database", (done) => {
      const validObject1 = masterTimeZoneTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });


    it("should save multple valid masterTimeZone(s) to database", (done) => {
      const validObject1 = masterTimeZoneTestData.validObject1;
      const validObject2 = masterTimeZoneTestData.validObject2;
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

  describe("testing masterTimeZone.find", () => {
    // Testing save
    // 1. Valid masterTimeZone should be saved.
    // 2. Non masterTimeZone object should not be saved.
    // 3. Should not save same masterTimeZone twice.
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
          return collection.save(_.merge(masterTimeZoneTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject5, {
            "tenantId": tenantOne
          }));
        })

        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject5, {
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
        "zoneCode": "IST"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("zoneCode")
            .to.equal("IST");
          done();
        });
    });

    it("should return ASBA, the first masterTimeZone when sorted by masterTimeZoneCode", (done) => {
      let res = collection.find({}, {
        "zoneCode": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("zoneCode")
            .to.equal('ART');
          done();
        });
    });

    it("should return Platform, the last masterTimeZone when sorted by masterTimeZoneCode", (done) => {
      let res = masterTimeZone.find(tenantOne, {}, {}, {}, {
        "zoneCode": -1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("zoneCode")
            .to.equal('JST');
          done();
        });
    });

    it("should return 5 enabled masterTimeZones", (done) => {
      let res = masterTimeZone.find(tenantOne, {}, {}, {
        "enableFlag": "false"
      }, {
        "zoneCode": -1
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
            .to.have.property("zoneCode")
            .to.equal("JST");
          expect(app[4])
            .to.have.property("zoneCode")
            .to.equal('ART');
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
          return collection.save(_.merge(masterTimeZoneTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(masterTimeZoneTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should disable Platform masterTimeZone", (done) => {
      let res = masterTimeZone.update(tenantOne, {}, {}, "JST", {
        "updateBy": "system",
        "enableFlag": "true",
        "updatedDate": new Date()
          .toISOString(),
        "description": "Updated the masterTimeZone at: " + Date.now()
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