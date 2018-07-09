const debug = require("debug")("evolvus-user.test.db.user");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const user = require("../../db/user");
const userTestData = require("./userTestData");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/user.js
describe("db user testing", () => {

    const tenantOne = "IVL";
    const tenantTwo = "KOT";

    /*
     ** Before doing any tests, first get the connection.
     */
    before((done) => {
        mongoose.connect(MONGO_DB_URL);
        let connection = mongoose.connection;
        connection.once("open", () => {
            debug("ok got the connection");
            done();
        });
    });

    // describe("testing user.save", () => {
    //     // Testing save
    //     // 1. Valid user should be saved.
    //     // 2. Non user object should not be saved.
    //     // 3. Should not save same user twice.
    //     beforeEach((done) => {
    //         user.deleteAll(tenantOne)
    //             .then((data) => {
    //                 return user.deleteAll(tenantTwo);
    //             })
    //             .then((data) => {
    //                 done();
    //             });
    //     }, 8000);

    //     it("should fail saving invalid object to database", (done) => {
    //         // try to save an invalid object
    //         const invalidObject1 = userTestData.invalidObject1;
    //         let res = user.save(tenantOne, invalidObject1);
    //         expect(res)
    //             .to.be.eventually.rejectedWith("User validation failed")
    //             .notify(done);
    //     });

    //     it("should fail saving duplicate object to database", (done) => {
    //         // save a valid object, then try to save another
    //         const validObject1 = userTestData.validObject1;
    //         user.save(tenantOne, validObject1)
    //             .then((success) => {
    //                 let res = user.save(tenantOne, validObject1);
    //                 expect(res)
    //                     .to.be.eventually.rejectedWith("duplicate")
    //                     .notify(done);
    //             });
    //     });

    //     it("should save valid user to database", (done) => {
    //         const validObject1 = userTestData.validObject1;
    //         let res = user.save(tenantOne, validObject1);
    //         expect(res)
    //             .to.eventually.not.have.property("userPassword")
    //             .notify(done);
    //     });

    //     it("should save multple valid user(s) to database", (done) => {
    //         const validObject1 = userTestData.validObject1;
    //         const validObject2 = userTestData.validObject2;

    //         user.save(tenantOne, validObject1)
    //             .then((value) => {
    //                 expect(value)
    //                     .to.have.property("_id");
    //                 return user.save(tenantOne, validObject2);
    //             })
    //             .then((value) => {
    //                 expect(value)
    //                     .to.have.property("_id");
    //                 done();
    //             });
    //     });

    //     it("should save valid user(s) for multiple tenants to database", (done) => {
    //         const validObject1 = userTestData.validObject1;
    //         const validObject2 = userTestData.validObject2;

    //         user.save(tenantOne, validObject1)
    //             .then((value) => {
    //                 expect(value)
    //                     .to.have.property("_id");
    //                 return user.save(tenantTwo, validObject2);
    //             })
    //             .then((value) => {
    //                 expect(value)
    //                     .to.have.property("_id");
    //                 done();
    //             });
    //     });

    // }); // testing save

    describe("testing user.find", () => {
        // Testing find
        // 1. Valid user should be saved.
        // 2. Non user object should not be saved.
        // 3. Should not save same user twice.
        beforeEach((done) => {
            user.deleteAll(tenantOne)
                .then((value) => {
                    return user.deleteAll(tenantTwo);
                })
                .then((value) => {
                    console.log("saved1");

                    return user.save(tenantOne, userTestData.validObject1);
                })
                .then((value) => {
                    console.log("saved2");

                    return user.save(tenantOne, userTestData.validObject2);
                })
                .then((value) => {
                    console.log("saved3");

                    return user.save(tenantOne, userTestData.validObject3);
                })
                .then((value) => {
                    console.log("saved4");

                    return user.save(tenantOne, userTestData.validObject4);
                })
                .then((value) => {
                    console.log("saved5");

                    return user.save(tenantOne, userTestData.validObject5);
                })
                .then((value) => {
                    console.log("saved6");

                    return user.save(tenantOne, userTestData.validObject6);
                })
                .then((value) => {
                    console.log("saved7");

                    return user.save(tenantOne, userTestData.validObject7);
                })
                .then((value) => {
                    console.log("saved8");

                    return user.save(tenantOne, userTestData.validObject8);
                })
                .then((value) => {
                    console.log("saved9");
                    done();
                    // return user.save(tenantTwo, userTestData.validObject1);
                });
            // .then((value) => {
            //         console.log("saved10");

            //         return user.save(tenantTwo, userTestData.validObject2);
            //     })
            //     .then((value) => {
            //         console.log("saved11");

            //         return user.save(tenantTwo, userTestData.validObject3);
            //     })
            //     .then((value) => {
            //         console.log("saved12");

            //         return user.save(tenantTwo, userTestData.validObject4);
            //     })
            //     .then((value) => {
            //         console.log("saved13");

            //         return user.save(tenantTwo, userTestData.validObject5);
            //     })
            //     .then((value) => {
            //         console.log("saved14");

            //         return user.save(tenantTwo, userTestData.validObject6);
            //     })
            //     .then((value) => {
            //         console.log("saved15");

            //         return user.save(tenantTwo, userTestData.validObject7);
            //     })
            //     .then((value) => {
            //         console.log("saved16");

            //         return user.save(tenantTwo, userTestData.validObject8);
            //     })
            //     .then((value) => {
            //         console.log("saved17");

            //         done();
            //     });
        });

        it("should return all the values of a tenant", (done) => {
            let res = user.find(tenantOne, {}, {}, 0, 0);

            expect(res)
                .to.eventually.have.lengthOf(8)
                .notify(done);
        });

        it("should return a single value of a tenant", (done) => {
            let res = user.find(tenantOne, {}, {}, 0, 1);

            expect(res)
                .to.eventually.have.lengthOf(1)
                .notify(done);
        });

        it("should return a user Object ", (done) => {
            let res = user.find(tenantOne, {
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
            let res = user.find(tenantOne, {}, {
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
            let res = user.find(tenantOne, {}, {
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

        it("should return 6 enabled users", (done) => {
            let res = user.find(tenantOne, {
                "enabledFlag": "1"
            }, {
                "userName": -1
            }, 0, 10);

            expect(res)
                .to.have.be.fulfilled.then((user) => {
                    debug("result: " + JSON.stringify(user));
                    expect(user)
                        .to.have.lengthOf(6);
                    expect(user[0])
                        .to.have.property("tenantId")
                        .to.equal(tenantOne);
                    expect(user[0])
                        .to.have.property("userName")
                        .to.equal("sriharig");
                    expect(user[5])
                        .to.have.property("userName")
                        .to.equal("kavyak");
                    done();
                });
        });

    }); // findAll testing

    describe("update testing", () => {
        beforeEach((done) => {
            user.deleteAll(tenantOne)
                .then((value) => {
                    return user.deleteAll(tenantTwo);
                })
                .then((value) => {
                    return user.save(tenantOne, userTestData.validObject1);
                })
                .then((value) => {
                    return user.save(tenantOne, userTestData.validObject2);
                })
                .then((value) => {
                    return user.save(tenantOne, userTestData.validObject3);
                })
                .then((value) => {
                    return user.save(tenantOne, userTestData.validObject4);
                })
                .then((value) => {
                    done();
                });
        });

        it("should disable user kavya", (done) => {
            let res = user.update(tenantOne, "kavyak", {
                "enabledFlag": "0",
                "updatedDate": new Date()
                    .toISOString()
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