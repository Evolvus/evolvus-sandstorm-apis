const debug = require("debug")("evolvus-user.test.index");
const chai = require("chai");
const mongoose = require("mongoose");
const _ = require("lodash");
var randomstring = require("randomstring");
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const user = require("../index");
const entity = require("@evolvus/evolvus-entity");
const role = require("@evolvus/evolvus-role");
const dbSchema = require("../db/userSchema");
const userTestData = require("./userTestData");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("user", dbSchema);
const connection = require("@evolvus/evolvus-mongo-dao").connection;


describe('user model validation', () => {

  const tenantOne = "IVL";
  const tenantTwo = "KOT";
  const entityId = "H001B001";
  const accessLevel = "0";

  let undefinedObject; // object that is not defined
  let nullObject = null; // object that is null

  // before we start the tests, connect to the database
  before((done) => {

    var dbConnection = connection.connect("PLATFORM").then(() => {
      // app.on('application_started', done());
      done();
    }).catch((e) => {
      done(e);
    });

  });

  describe("validation against jsonschema", () => {
    it("valid user should validate successfully", (done) => {
      try {
        var res = user.validate(userTestData.validObject1);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid user object should not throw exception: ${e}`);
      }
    });

    it("invalid user should return errors", (done) => {
      try {
        var res = user.validate(userTestData.invalidObject1);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    // it("should error out for undefined objects", (done) => {
    //   try {
    //     var res = user.validate(undefinedObject);
    //     expect(res)
    //       .to.be.rejected
    //       .notify(done);
    //   } catch (e) {
    //     expect.fail(e, null, `exception: ${e}`);
    //   }
    // });

    it("should error out for null objects", (done) => {
      try {
        var res = user.validate(nullObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe("testing user.save method", () => {
  
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
  
    it('should save a valid user object to database', (done) => {
      try {
        // Promise.all([entity.save(tenantOne, "Kavya", "H001B001", "1", userTestData.entityObject), role.save(tenantOne, "Kavya", "1", "H001B001", userTestData.roleObject)]).then((res) => {
        //   var result = user.save(tenantOne, "192.168.1.115", "Kavya", "0", userTestData.validObject1);
        //   //replace anyAttribute with one of the valid attribute of a user Object
        //   expect(result)
        //     .to.eventually.have.property("_id")
        //     .notify(done);
        // }).then((e) => {
        //   done(e);
        // });
        var result = user.save(tenantOne, "192.168.1.115", "Kavya", "0", userTestData.validObject1);
        //replace anyAttribute with one of the valid attribute of a user Object
        expect(result)
          .to.be.eventually.have.property("nModified")
          .to.eql(1)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving user object should not throw exception: ${e}`);
      }
    }, 10000);
  
    it('should not save a invalid user object to database', (done) => {
      try {
        var result = user.save(tenantOne, "192.168.1.115", "Kavya", userTestData.invalidObject1);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe('testing user.find', () => {
    let object1 = userTestData.validObject1,
      object2 = userTestData.validObject2,
      object3 = userTestData.validObject3,
      object4 = userTestData.validObject4,
      object5 = userTestData.validObject5;

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
            "tenantId": tenantTwo,
            "userId": "SRIHARIG",
            "contact.emailId": randomstring.generate(6) + "@gmail.com"
          }));
        })
        .then((value) => {

          return collection.save(_.merge(object2, {
            "tenantId": tenantTwo,
            "userId": "KAVYAKM",
            "contact.emailId": randomstring.generate(6) + "@gmail.com"
          }));
        })
        .then((value) => {

          return collection.save(_.merge(object3, {
            "tenantId": tenantTwo,
            "userId": "PAVITHRAT",
            "contact.emailId": randomstring.generate(6) + "@gmail.com"
          }));
        })
        .then((value) => {

          return collection.save(_.merge(object4, {
            "tenantId": tenantTwo,
            "userId": "KAMALAK",
            "contact.emailId": randomstring.generate(6) + "@gmail.com"
          }));
        })
        .then((value) => {

          return collection.save(_.merge(object5, {
            "tenantId": tenantTwo,
            "userId": "VIGNESHP",
            "contact.emailId": randomstring.generate(6) + "@gmail.com"
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should return all the values of tenant One only", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {}, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          expect(users)
            .to.have.lengthOf(5);
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[1])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[2])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[3])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[4])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          done();
        });
    });

    it("should return all the values of tenant Two only", (done) => {
      let res = user.find(tenantTwo, entityId, accessLevel, "kavya", "192.168.1.115", {}, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          expect(users)
            .to.have.lengthOf(5);
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(users[1])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(users[2])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(users[3])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(users[4])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          done();
        });
    });

    //There are two users with same userName as kavyak and different tenantId
    //It should return only one user from one tenant
    it("should return a user Object from tenantTwo", (done) => {
      var filter = {
        userName: "kavyak"
      };
      let res = user.find(tenantTwo, entityId, accessLevel, "kavya", "192.168.1.115", filter, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantTwo);
          expect(users[0])
            .to.have.property("userName")
            .to.equal("kavyak");
          done();
        });
    });


    it("should return a single value of a tenantOne", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {
        "userName": "kavyak"
      }, {}, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((user) => {
          debug("result:" + JSON.stringify(user));
          expect(user[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(user[0])
            .to.have.property("userName")
            .to.equal("kavyak");
          done();
        });
    });

    it("should return kamala, the first user when sorted by userName", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {}, {
        "userName": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((user) => {
          debug("result: " + JSON.stringify(user));
          expect(user[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(user[0])
            .to.have.property("userName")
            .to.equal("kamala");
          done();
        });
    });

    it("should return vignesh, the last user when sorted by userName", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {}, {
        "userName": -1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((user) => {
          debug("result: " + JSON.stringify(user));
          expect(user[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(user[0])
            .to.have.property("userName")
            .to.equal("vignesh");
          done();
        });
    });

    it("should return 3 enabled users", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {
        "enabledFlag": "true"
      }, {
        "userName": -1
      }, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((user) => {
          debug("result: " + JSON.stringify(user));
          expect(user)
            .to.have.lengthOf(3);
          expect(user[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(user[0])
            .to.have.property("userName")
            .to.equal("sriharig");
          expect(user[2])
            .to.have.property("userName")
            .to.equal("kavyak");
          done();
        });
    });

    it("should return all users from tenantOne if accessLevel is 0", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {}, {}, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          debug("result: " + JSON.stringify(user));
          expect(users)
            .to.have.lengthOf(5);
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          done();
        });
    });

    it("should return only 2 users from tenantOne if accessLevel is 2", (done) => {
      let res = user.find(tenantOne, entityId, "2", "kavya", "192.168.1.115", {}, {
        userName: -1
      }, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          debug("result: " + JSON.stringify(user));
          expect(users)
            .to.have.lengthOf(2);
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[0])
            .to.have.property("userId")
            .to.equal(object5.userId);
          expect(users[1])
            .to.have.property("userId")
            .to.equal(object4.userId);
          done();
        });
    });

    it("should return only 4 users from tenantOne if accessLevel is 1", (done) => {
      let res = user.find(tenantOne, entityId, "1", "kavya", "192.168.1.115", {}, {
        userName: -1
      }, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          debug("result: " + JSON.stringify(user));
          expect(users)
            .to.have.lengthOf(4);
          expect(users[0])
            .to.have.property("tenantId")
            .to.equal(tenantOne);
          expect(users[0])
            .to.have.property("userId")
            .to.equal(object5.userId);
          expect(users[3])
            .to.have.property("userId")
            .to.equal(object4.userId);
          done();
        });
    });

    it("should not contain userPassword,token and saltString properties", (done) => {
      let res = user.find(tenantOne, entityId, accessLevel, "kavya", "192.168.1.115", {}, {}, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((users) => {
          debug("result: " + JSON.stringify(user));
          expect(users)
            .to.have.lengthOf(5);
          expect(users[0])
            .to.not.have.property("userPassword");
          expect(users[0])
            .to.not.have.property("token");
          expect(users[0])
            .to.not.have.property("saltString");
          expect(users[1])
            .to.not.have.property("userPassword");
          expect(users[1])
            .to.not.have.property("token");
          expect(users[1])
            .to.not.have.property("saltString");

          done();
        });
    });

    it('should throw IllegalArgumentException for null value of tenantId', (done) => {
      try {
        let res = user.find(null, entityId, accessLevel, "kavya", "192.168.1.115", {}, {}, 0, 1);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("update testing", () => {
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
          return collection.save(_.merge(userTestData.validObject1, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(userTestData.validObject2, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(userTestData.validObject3, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          return collection.save(_.merge(userTestData.validObject4, {
            "tenantId": tenantOne
          }));
        })
        .then((value) => {
          done();
        });
    });

    it("should disable user kavya", (done) => {
      let res = user.update(tenantOne, "KAVYAKM", {
        "enabledFlag": "false"
      }, accessLevel, entityId);
      expect(res)
        .to.have.be.fulfilled.then((user) => {
          debug("result: " + JSON.stringify(user));
          expect(user)
            .to.have.property("nModified")
            .to.equal(1);
          done();
        });
    });

    it("should not update user with wrong entity value", (done) => {
      let res = user.update(tenantOne, "KAVYAKM", {
        "entityId": "Kavya"
      }, accessLevel, entityId);
      expect(res)
        .to.be.rejectedWith("User update failed due the selected Entity not found")
        .notify(done);
    });

    it("should not update user with invalid role object", (done) => {
      let res = user.update(tenantOne, "KAVYAKM", {
        "role": userTestData.roleObject
      }, accessLevel, entityId);
      expect(res)
        .to.be.rejectedWith(`Role ${userTestData.roleObject.roleName} not found`)
        .notify(done);
    });

    it("should not update user if selected role is not the authorized one", (done) => {
      var roleObj = _.merge(userTestData.roleObject, {
        "roleName": "ADMIN"
      });
      let res = user.update(tenantOne, "KAVYAKM", {
        "role": roleObj
      }, accessLevel, entityId);
      expect(res)
        .to.be.rejectedWith(`Role ${userTestData.roleObject.roleName} must be AUTHORIZED`)
        .notify(done);
    });

    it("should be rejected if no user found", (done) => {
      var roleObj = _.merge(userTestData.roleObject, {
        "roleName": "ADMIN"
      });
      let res = user.update(tenantOne, "sffsdgh", {
        "role": roleObj
      }, accessLevel, entityId);
      expect(res)
        .to.be.rejectedWith(`No user found matching the userId SFFSDGH`)
        .notify(done);
    });

  });
});