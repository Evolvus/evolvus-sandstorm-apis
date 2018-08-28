const debug = require("debug")("evolvus-lookup.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/lookupSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("lookup", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Test_Dev";

const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);
const lookupTestData = require("./lookupTestData");
const lookup = require("../index");

const tenantOne = "T001";
const tenantTwo = "T002";
describe('lookup model validation', () => {
  let lookupObject = {
    "tenantId":"T001",
    "lookupCode": "PRODUCT_CODE",
    "wfInstanceStatus": "wfStatus",
    "entityCode": "entity1",
    "createdBy": "Srihari",
    "createdDate": new Date()
      .toISOString(),
    "enabled": "1",
    "value": "PRD008",
    "updatedBy": "",
    "lastUpdatedDate":  new Date()
    .toISOString()
  };

  let invalidObject = {

    lookupName: "Docket",
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

  describe("validation against jsonschema", () => {
    it("valid lookup should validate successfully", (done) => {
      try {
  
        var res = lookup.validate(lookupObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid lookup object should not throw exception: ${e}`);
      }
    });
  
    it("invalid lookup should return errors", (done) => {
      try {
        var res = lookup.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for undefined objects", (done) => {
      try {
        var res = lookup.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for null objects", (done) => {
      try {
        var res = lookup.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
  });
  
  describe("testing update lookup", () => {
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
          return collection.save(_.merge(lookupTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
  
    it('should update a lookup with new values', (done) => {
      var res = lookup.update(tenantOne,{},{},"PRODUCT_CODE", {
        "enableFlag": 1,
        "lookupCode": "PRODUCT_CODE",
        "lastUpdatedDate": new Date()
          .toISOString(),
        "valueOne":"one"
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
      let res = lookup.update(undefinedId,{},{}, "PRODUCT_CODE", {
        lookupName: "DOCKET SERVERSSSS"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = lookup.update(tenantOne,{},{}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = lookup.update(tenantOne,{},{}, "DOCKET", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = lookup.update(null,{},{}, "PRODUCT_CODE", {
        lookupName: "DOCKET audit server"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = lookup.update(tenantOne, null, {
        lookupCode: "PRODUCT_CODE"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = lookup.update(tenantOne, "PRODUCT_CODE", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
  //dbtesting
   describe("testing lookup.save", () => {
    // Testing save
    // 1. Valid lookup should be saved.
    // 2. Non lookup object should not be saved.
    // 3. Should not save same lookup twice.
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
      const invalidObject1 = lookupTestData.invalidObject1;
      let object = _.merge(invalidObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.be.eventually.rejectedWith("lookup validation failed")
        .notify(done);
    });
    
  
    it("should save valid lookup to database", (done) => {
      const validObject1 = lookupTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });
    
  
    it("should save multple valid lookup(s) to database", (done) => {
      const validObject1 = lookupTestData.validObject1;
      const validObject2 = lookupTestData.validObject2;
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
  
   describe("testing lookup.find", () => {
//     // Testing save
//     // 1. Valid lookup should be saved.
//     // 2. Non lookup object should not be saved.
//     // 3. Should not save same lookup twice.
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
          return collection.save(_.merge(lookupTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject5, {
            "tenantId": tenantOne
          }));
        })

        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject5, {
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
        "lookupCode": "PRODUCT_CODE"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("lookupCode")
            .to.equal("PRODUCT_CODE");
          done();
        });
    });

    it("should return lookupObject, the first lookup when sorted by lookupCode", (done) => {
      let res = collection.find({}, {
        "lookupCode": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("lookupCode")
            .to.equal("PRODUCT_CODE");
          done();
        });
    });

    it("should return lookupObject, the last lookup when sorted by lookupCode", (done) => {
      let res = lookup.find(tenantOne,{},{}, {}, {
        "lookupCode": -1
      }, 0, 1);
    
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("lookupCode")
            .to.equal("PRODUCT_CODE");
          done();
        });
    });

    it("should return 5 lookups", (done) => {
      let res = lookup.find(tenantOne,{},{}, {
        "lookupCode": "PRODUCT_CODE"
      }, {
        "lookupCode": -1
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
            .to.have.property("lookupCode")
            .to.equal("PRODUCT_CODE");
          expect(app[4])
            .to.have.property("lookupCode")
            .to.equal('PRODUCT_CODE');
          done();
        });
    });

   }); // findAll testing
  
  describe("update testing", () => {
    beforeEach((done) => {
      collection.deleteAll({"tenantId":tenantOne})
        .then((value) => {
          return collection.deleteAll({"tenantId":tenantTwo});
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(lookupTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
    it("should disable Platform lookup", (done) => {
      let res = lookup.update(tenantOne,{},{}, "PRODUCT_CODE", {
        "value": "ONE",
        "lastupdatedDate": new Date()
          .toISOString(),
        "description": "Updated the lookup at: " + Date.now()
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