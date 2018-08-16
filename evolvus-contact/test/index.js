const debug = require("debug")("evolvus-contact.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";

const chaiAsPromised = require("chai-as-promised");

const _ = require('lodash');
const dbSchema = require("./.././db/contactSchema");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("contact", dbSchema);
const expect = chai.expect;
chai.use(chaiAsPromised);
const contactTestData = require("./contactTestData");
const contact = require("../index");


const tenantOne = "T001";
const tenantTwo = "T002";

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
    "phoneNumber": "7",
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

  describe("validation against jsonschema", () => {
    it("valid contact should validate successfully", (done) => {
      try {
  
        var res = contact.validate(contactObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid contact object should not throw exception: ${e}`);
      }
    });
  
    it("invalid contact should return errors", (done) => {
      try {
        var res = contact.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for undefined objects", (done) => {
      try {
        var res = contact.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
    it("should error out for null objects", (done) => {
      try {
        var res = contact.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  
  });

  describe("testing update contact", () => {
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
          return collection.save(_.merge(contactTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
  
    it('should update a contact with new values', (done) => {
      var res = contact.update(tenantOne,{},{},"xyz@gmail.com", {
        "phoneNumber":9597864523,
        "country": "INDIA",
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
      let res = contact.update(undefinedId,{},{}, "xyz@gmail.com", {
        country: "china"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let undefinedCode;
      let res = contact.update(tenantOne,{},{}, undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = contact.update(tenantOne,{},{}, "xyz@gmail.com", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = contact.update(null,{},{}, "xyz@gmail.com", {
        country: "America"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = contact.update(tenantOne,{},{}, null, {
        contactName: "DOCKET"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  
    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = contact.update(tenantOne,{},{}, "xyz@gmail.com", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });

  describe("testing contact.save", () => {
    // Testing save
    // 1. Valid contact should be saved.
    // 2. Non contact object should not be saved.
    // 3. Should not save same contact twice.
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
    //   const invalidObject1 = contactTestData.invalidObject1;
    //   let object = _.merge(invalidObject1, {
    //     "tenantId": tenantOne
    //   });
    //   let res = collection.save(object);
    //   expect(res)
    //     .to.be.eventually.rejectedWith("contact validation failed")
    //     .notify(done);
    // });

    
    // it("should fail saving duplicate object to database", (done) => {
    //   // save a valid object, then try to save another
    //   const validObject1 = contactTestData.validObject1;
    //   let object = _.merge(validObject1, {
    //     "tenantId": tenantOne
    //   });
    //   collection.save(object)
    //     .then((success) => {
    //       let res = collection.save(object);
    //       expect(res)
    //         .to.be.eventually.rejectedWith("duplicate")
    //         .notify(done);
    //     });
    // });
  
    it("should save valid contact to database", (done) => {
      const validObject1 = contactTestData.validObject1;
      let object = _.merge(validObject1, {
        "tenantId": tenantOne
      });
      let res = collection.save(object);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });
    
      it("should save multple valid contact(s) to database", (done) => {
      const validObject1 = contactTestData.validObject1;
      const validObject2 = contactTestData.validObject2;
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

  describe("testing contact.find", () => {
    // Testing save
    // 1. Valid contact should be saved.
    // 2. Non contact object should not be saved.
    // 3. Should not save same contact twice.
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
          return collection.save(_.merge(contactTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject5, {
            "tenantId": tenantOne
          }));
        })

        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject5, {
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
        "emailId": "xyz@gmail.com"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result:" + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("emailId")
            .to.equal("xyz@gmail.com");
          done();
        });
    });

    it("should return ASBA, the first contact when sorted by emailId", (done) => {
      let res = collection.find({}, {
        "emailId": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("emailId")
            .to.equal("binai@gmail.com");
          done();
        });
    });

    it("should return Platform, the last contact when sorted by emailId", (done) => {
      let res = contact.find(tenantOne,{},{}, {}, {
        "emailId": -1
      }, 0, 1);
    
      expect(res)
        .to.have.be.fulfilled.then((app) => {
          debug("result: " + JSON.stringify(app));
          expect(app[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(app[0])
            .to.have.property("emailId")
            .to.equal("xyz@gmail.com");
          done();
        });
    });

    it("should return 5 enabled contacts", (done) => {
      let res = contact.find(tenantOne,{},{}, {
        "tenantId": "T001"
      }, {
        "emailId": -1
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
            .to.have.property("emailId")
            .to.equal('xyz@gmail.com');
          expect(app[4])
            .to.have.property("emailId")
            .to.equal('binai@gmail.com');
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
          return collection.save(_.merge(contactTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(contactTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });
  
    it("should disable Platform contact", (done) => {
      let res = contact.update(tenantOne,{},{}, "xyz@gmail.com", {
        "country": "india",
        "updatedDate": new Date()
          .toISOString(),
        "description": "Updated the contact at: " + Date.now()
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