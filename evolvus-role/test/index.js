const debug = require("debug")("evolvus-role.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const dbSchema = require("../db/roleSchema");
const _ = require("lodash");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const role = require("../index");

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("role", dbSchema);

const roleTestData = require("./roleTestData");
const tenantOne = "IVL";
const tenantTwo = "KOT";
const entityId = "H001B001";
const accessLevel = "1";

describe('role model validation', () => {

  let invalidObject = {
    //add invalid role Object here
    "tenantId": "IVL",
    "entityId": "Entity2",
    "accessLevel": "1",
    "applicationCode": "CDA",
    "enableFlag": "1",
    "menuGroup": [{
      "tenantId": "tid",
      "applicationCode": "CDA",
      "menuGroupCode": "mgc",
      "title": "menugroup title",
      "menuItems": [{
        "menuItemType": "queues",
        "applicationCode": "CDA",
        "menuItemCode": "mic",
        "title": "menuItem title"
      }, {
        "menuItemType": "queues",
        "applicationCode": "RTP",
        "menuItemCode": "mic",
        "title": "menuItem title"
      }]
    }],
    "description": "admin_One decription *",
    "activationStatus": "ACTIVE",
    "associatedUsers": 5,
    "createdBy": "kamalarani",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString()
  };

  let undefinedObject; // object that is not defined
  let nullObject = null; // object that is null

  // before we start the tests, connect to the database
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

  describe("validation against jsonschema", () => {

    it("valid role should validate successfully", (done) => {
      try {
        const validObject1 = roleTestData.validObject1;
        var res = role.validate(validObject1);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid role object should not throw exception: ${e}`);
      }
    });

    it("invalid role should return errors", (done) => {
      try {
        var res = role.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for undefined objects", (done) => {
      try {
        var res = role.validate(undefinedObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should error out for null objects", (done) => {
      try {
        var res = role.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing role.save method", () => {

    beforeEach(function(done) {
      this.timeout(10000);
      collection.deleteAll({
          tenantId: tenantOne
        })
        .then((data) => {
          return collection.deleteAll({
            tenantId: tenantTwo
          });
        })
        .then((data) => {
          done();
        });
    });

    it('should save a valid role object to database', (done) => {
      try {
        var result = role.save(tenantOne, "user", "192.168.1.122", "1", "H001B001", roleTestData.validObject1);
        expect(result)
          .to.eventually.have.property("nModified")
          .to.equal(1)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving role object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid role object to database', (done) => {
      try {
        var result = role.save("T001", "user", "H001B001", "1", roleTestData.validObject1);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing update Role", () => {
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
          return collection.save(_.merge(roleTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(roleTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(roleTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(roleTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });

    it('should update a role with new values', (done) => {
      var res = role.update(tenantOne, "user", "192.168.1.122", "ADMIN_ONE", {
        "enableFlag": true,
        "roleName": "ADMIN_ONE",
        "description": "test update"
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
      let res = role.update(undefinedId, "user", "192.168.1.122", "ADMIN_ONE", {
        roleName: "Admin"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined code parameter ", (done) => {
      let undefinedCode;
      let res = role.update("T001", "user", "192.168.1.122", undefinedCode, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = role.update(tenantOne, "user", "192.168.1.122", "admin_One", undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null tenantId parameter ", (done) => {
      let res = role.update(null, "user", "192.168.1.122", "ADMINN", {
        "enableFlag": true,
        "roleName": "ADMINN",
        "description": "test update"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null code parameter ", (done) => {
      let res = role.update("T001", "user", "192.168.1.122", null, {
        "enableFlag": true,
        "roleName": "ADMINN",
        "description": "test update"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      let res = role.update("T001", "user", "192.168.1.122", "ADMINN", null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should disable role ADMIN_ONE", (done) => {
      let res = role.update(tenantOne, "user", "192.168.1.122", "ADMIN_ONE", {
        "enableFlag": "false"
      });
      expect(res)
        .to.have.be.fulfilled.then((role) => {
          debug("result: " + JSON.stringify(role));
          expect(role)
            .to.have.property("nModified")
            .to.equal(1);
          done();
        });
    });

    it("should not update the already exists roleName", (done) => {
      let res = role.update(tenantOne, "user", "192.168.1.122", "ADMIN_ONE", {
        "roleName": "ADMIN_ONE"
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

    it("should be rejected if no role found", (done) => {
      let res = role.update(tenantOne, "user", "192.168.1.122", "sff654dgh", {
        "description": "jkhdfugf"
      });
      expect(res)
        .to.be.rejectedWith(`Role SFF654DGH, not found `)
        .notify(done);
    });

  });

  describe('testing role.find', () => {

    let object1 = roleTestData.validObject1,
      object2 = roleTestData.validObject2,
      object3 = roleTestData.validObject3,
      object4 = roleTestData.validObject4,
      object5 = roleTestData.validObject5;

    beforeEach(function(done) {
      this.timeout(10000);
      collection.deleteAll({
          tenantId: tenantOne
        })
        .then((value) => {
          return collection.deleteAll({
            tenantId: tenantTwo
          });
        })
        .then((value) => {
          return collection.save(_.merge(object1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object5, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object1, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object2, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object3, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object4, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          return collection.save(_.merge(object5, {
            "tenantId": tenantTwo
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should return all the values of tenant One only", (done) => {
      let res = role.find(tenantOne, "user", "198.162.1.122", {}, {}, 0, 0);
      expect(res)
        .to.have.be.fulfilled.then((roles) => {
          expect(roles)
            .to.have.lengthOf(5);
          expect(roles[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(roles[1])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(roles[2])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(roles[3])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(roles[4])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          done();
        });
    });

    it("should return all the values of tenant Two only", (done) => {
      let res = role.find(tenantTwo, "user", "198.162.1.122", {}, {}, 0, 0);
      expect(res)
        .to.have.be.fulfilled.then((roles) => {
          expect(roles)
            .to.have.lengthOf(5);
          expect(roles[0])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(roles[1])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(roles[2])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(roles[3])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(roles[4])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          done();
        });
    });

    //There are two roles with same roleName as admin_One and different tenantId
    //It should return only one role from one tenant
    it("should return a role Object from tenantTwo", (done) => {
      var filter = {
        roleName: "ADMIN_ONE"
      };
      let res = role.find(tenantTwo, "user", "192.168.1.122", filter, {}, 0, 0);
      expect(res)
        .to.have.be.fulfilled.then((roles) => {
          expect(roles[0])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(roles[0])
            .to.have.property("roleName")
            .to.equal("ADMIN_ONE");
          done();
        });
    });

    it("should return a single value of a tenantOne", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {
        "roleName": "ADMIN_ONE"
      }, {}, 0, 1);
      expect(res)
        .to.have.be.fulfilled.then((role) => {
          debug("result:" + JSON.stringify(role));
          expect(role[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(role[0])
            .to.have.property("roleName")
            .to.equal("ADMIN_ONE");
          done();
        });
    });

    it("should return ADMIN_ONE, the first role when sorted by roleName", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {}, {
        "roleName": 1
      }, 0, 1);
      expect(res)
        .to.have.be.fulfilled.then((role) => {
          debug("result: " + JSON.stringify(role));
          expect(role[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(role[0])
            .to.have.property("roleName")
            .to.equal("ADMIN_ONE");
          done();
        });
    });

    it("should return admin_Two, the last role when sorted by roleName", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {}, {
        "roleName": -1
      }, 0, 1);
      expect(res)
        .to.have.be.fulfilled.then((role) => {
          debug("result: " + JSON.stringify(role));
          expect(role[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(role[0])
            .to.have.property("roleName")
            .to.equal("admin_Two");
          done();
        });
    });

    it("should return 3 enabled roles", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {
        "enableFlag": "true"
      }, {
        "roleName": -1
      }, 0, 10);
      expect(res)
        .to.have.be.fulfilled.then((role) => {
          debug("result: " + JSON.stringify(role));
          expect(role)
            .to.have.lengthOf(3);
          expect(role[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(role[0])
            .to.have.property("roleName")
            .to.equal("admin_Two");
          expect(role[2])
            .to.have.property("roleName")
            .to.equal("ADMIN_ONE");
          done();
        });
    });

    it("should return all roles from tenantOne if accessLevel is 1", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {}, {}, 0, 10);
      expect(res)
        .to.have.be.fulfilled.then((roles) => {
          debug("result: " + JSON.stringify(roles));
          expect(roles)
            .to.have.lengthOf(5);
          expect(roles[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          done();
        });
    });

    it("should return only 2 roles from tenantOne if accessLevel is 2", (done) => {
      let res = role.find(tenantOne, "user", "192.168.1.122", {
        accessLevel: "2"
      }, {
        roleName: -1
      }, 0, 10);
      expect(res)
        .to.have.be.fulfilled.then((roles) => {
          debug("result: " + JSON.stringify(roles));
          expect(roles)
            .to.have.lengthOf(2);
          expect(roles[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(roles[0])
            .to.have.property("roleName")
            .to.equal(object2.roleName);
          expect(roles[1])
            .to.have.property("roleName")
            .to.equal(object3.roleName);
          done();
        });
    });

    it('should throw IllegalArgumentException for null value of tenantId', (done) => {
      try {
        let res = role.find(null, "user", "192.168.1.122", {}, {}, 0, 1);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for undefined value of tenantId', (done) => {
      var undefinedId;
      try {
        let res = role.find(undefinedId, "user", "192.168.1.122", {}, {}, 0, 1);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

});