const debug = require("debug")("evolvus-application.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require('lodash');
const dbSchema = require("./.././db/applicationSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("application", dbSchema);
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Test_Dev";

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

  describe("validation against jsonschema", () => {
    it("valid application should validate successfully", (done) => {
      try {
  
        var res = application.validate(applicationObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid application object should not throw exception: ${e}`);
      }
    });
  
    it("invalid application should return errors", (done) => {
      try {
        var res = application.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for undefined objects", (done) => {
      try {
        var res = application.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for null objects", (done) => {
      try {
        var res = application.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
  });
  
  describe("testing update application", () => {
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
          return collection.save(_.merge(applicationTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
  
    it('should update a application with new values', (done) => {
      var res = application.update(tenantOne,{},{},"DOCKET", {
        "enableFlag": 1,
        "applicationCode": "DOCKET",
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
      let res = application.update(undefinedId,{},{}, "DOCKET", {
        applicationName: "DOCKET SERVERSSSS"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = application.update(tenantOne,{},{}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = application.update(tenantOne,{},{}, "DOCKET", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.update(null,{},{}, "DOCKET", {
        applicationName: "DOCKET audit server"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.update(tenantOne,{},{}, null, {
        applicationName: "DOCKET"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.update(tenantOne,{},{}, "CDA", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
  //dbtesting
  describe("testing application.save", () => {
    // Testing save
    // 1. Valid application should be saved.
    // 2. Non application object should not be saved.
    // 3. Should not save same application twice.
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
    //   const invalidObject1 = applicationTestData.invalidObject1;
    //   let object = _.merge(invalidObject1, {
    //     "tenantId": tenantOne
    //   });
    //   let res = collection.save(object);
    //   expect(res)
    //     .to.be.eventually.rejectedWith("application validation failed")
    //     .notify(done);
    // });

    
    it("should fail saving duplicate object to database", (done) => {
      // save a valid object, then try to save another
      const validObject1 = applicationTestData.validObject1;
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
  
    it("should save valid application to database", (done) => {
      const validObject1 = applicationTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });
    
  
    it("should save multple valid application(s) to database", (done) => {
      const validObject1 = applicationTestData.validObject1;
      const validObject2 = applicationTestData.validObject2;
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
  
  describe("testing application.find", () => {
    // Testing save
    // 1. Valid application should be saved.
    // 2. Non application object should not be saved.
    // 3. Should not save same application twice.
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
          return collection.save(_.merge(applicationTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject5, {
            "tenantId": tenantOne
          }));
        })

        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject5, {
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
        "applicationCode": "PLF"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("applicationCode")
            .to.equal("PLF");
          done();
        });
    });

    it("should return ASBA, the first application when sorted by applicationCode", (done) => {
      let res = collection.find({}, {
        "applicationCode": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("applicationCode")
            .to.equal("CDA");
          done();
        });
    });

    it("should return Platform, the last application when sorted by applicationCode", (done) => {
      let res = application.find(tenantOne,{},{}, {}, {
        "applicationCode": -1
      }, 0, 1);
    
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("applicationCode")
            .to.equal("PLF");
          done();
        });
    });

    it("should return 5 enabled applications", (done) => {
      let res = application.find(tenantOne,{},{}, {
        "enabledFlag": "true"
      }, {
        "applicationCode": -1
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
            .to.have.property("applicationCode")
            .to.equal("PLF");
          expect(app[4])
            .to.have.property("applicationCode")
            .to.equal('CDA');
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
          return collection.save(_.merge(applicationTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(applicationTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
    it("should disable Platform application", (done) => {
      let res = application.update(tenantOne,{},{}, "PLF", {
        "enableFlag": "0",
        "updatedDate": new Date()
          .toISOString(),
        "description": "Updated the application at: " + Date.now()
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