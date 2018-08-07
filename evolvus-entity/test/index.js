const debug = require("debug")("evolvus-entity.test.index");
const chai = require("chai");
const dbSchema = require("../db/entitySchema");
const mongoose = require("mongoose");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("entitycol", dbSchema);


var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");
const entityTestData = require("./entityTestData");
const expect = chai.expect;
chai.use(chaiAsPromised);

const entity = require("../index");
const tenantOne = {
  "tenantId": "T001"
};
const tenantTwo = {
  "tenantId": "T002"
};
describe('entity model validation', () => {
  let entityObject = {
    "tenantId": "IVL",
    "entityCode": "entity1",
    "name": "headOffice",
    "parent": "headOffice",
    "description": "bc1 description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "accessLevel": "1",
    "enableFlag": "true",
    "entityId": "abc12"
  };

  let invalidObject = {
    //add invalid menu Object here
    "tenantId": "IVL",
    "parent": "headOffice",
    "description": "northZone description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "accessLevel": "2",
    "entityId": "abc12ghi56"
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
    it("valid entity should validate successfully", (done) => {
      try {
        var res = entity.validate("T001", entityObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid entity object should not throw exception: ${e}`);
      }
    });

    it("invalid entity should return errors", (done) => {
      try {
        var res = entity.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if ("should error out for undefined objects", (done) => {
        try {
          var res = entity.validate(undefinedObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

    if ("should error out for null objects", (done) => {
        try {
          var res = entity.validate(nullObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

  });

  describe("testing entity.save method", () => {

    beforeEach((done) => {
      collection.deleteAll(tenantOne)
        .then((value) => {
          return collection.deleteAll(tenantTwo);
        }).then((value) => {
          return collection.save(entityTestData.seeddata1);
        }).then((value) => {
          return collection.save(entityTestData.seeddata2);
        }).then((value) => {
          done();
        });
    });

    it('should save a valid entity object to database', (done) => {
      try {
        var result = entity.save("T001", "user", "192.168.1.97", "H001B001", "0", entityTestData.validObject1);
        //replace anyAttribute with one of the valid attribute of a entity Object
        expect(result)
          .to.eventually.have.property("nModified").to.eql(1)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving entity object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid entity object to database', (done) => {
      try {
        var result = entity.save("T001", "user", "192.168.1.97", "H001B001", "0", entityTestData.invalidObject1);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });
  describe("testing entity.get methods", () => {

    beforeEach(function(done) {
      this.timeout(20000);
      collection.deleteAll(tenantOne)
        .then((value) => {
          return collection.deleteAll(tenantTwo);
        }).then((value) => {
          return collection.save(entityTestData.seeddata1);
        }).then((value) => {
          return collection.save(entityTestData.seeddata2);
        })
        .then((value) => {

          return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject1);
        })
        .then((value) => {

          return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject2);
        })
        .then((value) => {

          return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject3);
        })
        .then((ventitycolalue) => {

          return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject4);
        })
        .then((value) => {

          return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject5);
        })
        .then((value) => {

          return entity.save("T002", "pavithra", "192.168.1.97", "H001B002", "0", entityTestData.validObject1);
        })
        .then((value) => {

          return entity.save("T002", "pavithra", "192.168.1.97", "H001B002", "0", entityTestData.validObject2);
        })
        .then((value) => {

          return entity.save("T002", "pavithra", "192.168.1.97", "H001B002", "0", entityTestData.validObject3);
        })
        .then((value) => {

          return entity.save("T002", "pavithra", "192.168.1.97", "H001B002", "0", entityTestData.validObject4);
        })
        .then((value) => {

          return entity.save("T002", "pavithra", "192.168.1.97", "H001B002", "0", entityTestData.validObject5);
        })
        .then((value) => {

          done();
        });
    });

    it("should return all the values of a tenant T001", (done) => {
      let res = entity.find("T001", "pavithra", "192.168.1.97", "H001B001", "0", {}, {}, 0, 0);
      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          expect(entitys)
            .to.have.lengthOf(6);
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          done();
        });
    });


    it("should return all the values of tenant T002 only", (done) => {
      let res = entity.find("T002", "pavithra", "192.168.1.97", "H001B002", "0", {}, {}, 0, 0);
      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          expect(entitys)
            .to.have.lengthOf(6);
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T002");
          done();
        });
    });

    it("should return a entity Object from tenantTwo", (done) => {
      var filter = {
        name: "SOUTHZONE"
      };
      let res = entity.find("T002", "pavithra", "192.168.1.97", "H001B002", "0",filter, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T002");
          expect(entitys[0])
            .to.have.property("name")
            .to.equal("SOUTHZONE");
          done();
        });
    });
    it("should return a entity Object from tenantTwo", (done) => {
      var filter = {
        name: "SOUTHZONE"
      };
      let res = entity.find("T001", "pavithra", "192.168.1.97", "H001B001", "0",filter, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          expect(entitys[0])
            .to.have.property("name")
            .to.equal("SOUTHZONE");
          done();
        });
    });

    it("should return all entitys from tenantOne if accessLevel is 0", (done) => {
      let res = entity.find("T001", "pavithra", "192.168.1.97","H001B001", "0",  {}, {}, 0, 10);

      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          debug("result: " + JSON.stringify(entitys));
          expect(entitys)
            .to.have.lengthOf(6);
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          done();
        });
    });
    it("should return only 3 entitys from tenantOne if accessLevel is 2", (done) => {
      var filter = {
        accessLevel: "2"
      };
      let res = entity.find("T001", "pavithra", "192.168.1.97", "H001B001", "0",filter, {}, 0, 0);

      expect(res)
        .to.have.be.fulfilled.then((entitys) => {
          debug("result: " + JSON.stringify(entity));
          expect(entitys)
            .to.have.lengthOf(3);
          expect(entitys[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          expect(entitys[0])
            .to.have.property("entityCode")
            .to.equal( entityTestData.validObject3.entityCode);
          expect(entitys[1])
            .to.have.property("entityCode")
            .to.equal(entityTestData.validObject4.entityCode);
            expect(entitys[2])
              .to.have.property("entityCode")
              .to.equal(entityTestData.validObject5.entityCode);
          done();
        });
    });

    it("should return headOffice, the first entity when sorted by entity name", (done) => {
      let res = entity.find("T001", "pavithra", "192.168.1.97", "H001B001", "0", {}, {
        "name": 1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((entity) => {
          debug("result: " + JSON.stringify(entity));
          expect(entity[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          expect(entity[0])
            .to.have.property("name")
            .to.equal("HeadOffice");
          done();
        });
    });
    it("should return tamilnadu, the first entity when sorted by entity name", (done) => {
      let res = entity.find("T001", "pavithra", "192.168.1.97", "H001B001", "0", {}, {
        "name": -1
      }, 0, 1);

      expect(res)
        .to.have.be.fulfilled.then((entity) => {
          debug("result: " + JSON.stringify(entity));
          expect(entity[0])
            .to.have.property("tenantId")
            .to.equal("T001");
          expect(entity[0])
            .to.have.property("name")
            .to.equal("TAMILNADU");
          done();
        });
    });
    it('should throw IllegalArgumentException for null value of tenantId', (done) => {
      try {
        let res = entity.find(null,  "pavithra", "192.168.1.97","H001B001", "0",  {}, {}, 0, 1);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe("testing entity.update methods", () => {

  beforeEach(function(done) {
    this.timeout(20000);
    collection.deleteAll(tenantOne)
      .then((value) => {
        return collection.deleteAll(tenantTwo);
      }).then((value) => {
        return collection.save(entityTestData.seeddata1);
      }).then((value) => {
        return collection.save(entityTestData.seeddata2);
      })
      .then((value) => {

        return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject1);
      })
      .then((value) => {

        return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject2);
      })
      .then((value) => {

        return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject3);
      })
      .then((ventitycolalue) => {

        return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject4);
      })
      .then((value) => {

        return entity.save("T001", "pavithra", "192.168.1.97", "H001B001", "0", entityTestData.validObject5);
      })
      .then((value) => {

        done();
      });
  });

  it("should  update entity discription", (done) => {
    let res = entity.update("T001", "pavithra", "192.168.1.97","SOUTHZONE" , {
    "discription":"this is updated while test case"
    });
    expect(res)
            .to.eventually.have.property("nModified").to.eql(1)
          .notify(done);
  });
  it("should  not update entity if entity code is wrong", (done) => {
    let res = entity.update("T001", "pavithra", "192.168.1.97","Entity" , {
    "discription":"this is updated while test case"
    });
    expect(res)
    .to.be.rejectedWith("No entity found matching the entityCode Entity")
    .notify(done);
  });
});
});
