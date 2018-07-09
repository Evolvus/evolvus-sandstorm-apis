const debug = require("debug")("evolvus-user:index");
const model = require("./model/userSchema");
const db = require("./db/userSchema");
const _ = require('lodash');
const collection = require("./db/user");
const validate = require("jsonschema").validate;
const docketClient = require("evolvus-docket-client");

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

var docketObject = {
    // required fields
    contact: "PLATFORM",
    source: "contact",
    name: "",
    createdBy: "",
    ipAddress: "",
    status: "SUCCESS", //by default
    eventDateTime: Date.now(),
    keyDataAsJSON: "",
    details: "",
    //non required fields
    level: ""
};
module.exports = {
    model,
    db,
    filterAttributes,
    sortAttributes
};

var docketObject = {
    // required fields
    application: "PLATFORM",
    source: "user",
    name: "",
    createdBy: "",
    ipAddress: "",
    status: "SUCCESS", //by default
    eventDateTime: Date.now(),
    keyDataAsJSON: "",
    details: "",
    //non required fields
    level: ""
};

module.exports.validate = (userObject) => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof userObject === "undefined") {
                throw new Error("IllegalArgumentException:userObject is undefined");
            }
            var res = validate(userObject, schema);
            debug("validation status: ", JSON.stringify(res));
            if (res.valid) {
                resolve(res.valid);
            } else {
                reject(res.errors);
            }
        } catch (err) {
            reject(err);
        }
    });
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.

// tenantId cannot be null or undefined, InvalidArgumentError
// check if tenantId is valid from tenant table (todo)
//
// createdBy can be "System" - it cannot be validated against users
// ipAddress is needed for docket, must be passed
//
// object has all the attributes except tenantId, who columns
module.exports.save = (tenantId, ipAddress, createdBy, object) => {
    return new Promise((resolve, reject) => {
        try {
            if (tenantId == null || object == null) {
                throw new Error("IllegalArgumentException: tenantId/userObject is null or undefined");
            }
            docketObject.name = "user_save";
            docketObject.ipAddress = ipAddress;
            docketObject.createdBy = createdBy;
            docketObject.keyDataAsJSON = JSON.stringify(object);
            docketObject.details = `user creation initiated`;
            docketClient.postToDocket(docketObject);
            var res = validate(object, model);
            debug("validation status: ", JSON.stringify(res));
            if (!res.valid) {
                console.log("errors", res.errors);

                reject(res.errors[0].stack);
            } else {
                // Other validations here


                // if the object is valid, save the object to the database
                collection.save(tenantId, object).then((result) => {
                    debug(`saved successfully ${result}`);
                    resolve(result);
                }).catch((e) => {
                    debug(`failed to save with an error: ${e}`);
                    reject(e);
                });
            }
        } catch (e) {
            docketObject.name = "user_ExceptionOnSave";
            docketObject.ipAddress = ipAddress;
            docketObject.createdBy = createdBy;
            docketObject.keyDataAsJSON = JSON.stringify(object);
            docketObject.details = `caught Exception on user_save ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

// List all the objects in the database
// makes sense to return on a limited number
// (what if there are 1000000 records in the collection)

// tenantId should be valid
// createdBy should be requested user, not database object user, used for auditObject
// ipAddress should ipAddress
// filter should only have fields which are marked as filterable in the model Schema
// orderby should only have fields which are marked as sortable in the model Schema


module.exports.find = (tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit) => {
    return new Promise((resolve, reject) => {
        try {
            if (tenantId == null) {
                throw new Error("IllegalArgumentException: tenantId is null or undefined");
            }
            var invalidFilters = _.difference(_.keys(filter), filterAttributes);
            console.log("invalid", invalidFilters, "filter", filter);

            docketObject.name = "user_getAll";
            docketObject.keyDataAsJSON = `getAll with limit ${limit}`;
            docketObject.details = `user getAll method`;
            docketClient.postToDocket(docketObject);

            collection.find(tenantId, filter, orderby, skipCount, limit).then((docs) => {
                debug(`user(s) stored in the database are ${docs}`);
                resolve(docs);
            }).catch((e) => {
                debug(`failed to find all the user(s) ${e}`);
                reject(e);
            });
        } catch (e) {
            docketObject.name = "user_ExceptionOngetAll";
            docketObject.keyDataAsJSON = "userObject";
            docketObject.details = `caught Exception on user_getAll ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};


// Get the entity idenfied by the id parameter
module.exports.getById = (id) => {
    return new Promise((resolve, reject) => {
        try {

            if (typeof(id) == "undefined" || id == null) {
                throw new Error("IllegalArgumentException: id is null or undefined");
            }
            docketObject.name = "user_getById";
            docketObject.keyDataAsJSON = `userObject id is ${id}`;
            docketObject.details = `user getById initiated`;
            docketClient.postToDocket(docketObject);

            collection.findById(id)
                .then((res) => {
                    if (res) {
                        debug(`user found by id ${id} is ${res}`);
                        resolve(res);
                    } else {
                        // return empty object in place of null
                        debug(`no user found by this id ${id}`);
                        resolve({});
                    }
                }).catch((e) => {
                    debug(`failed to find user ${e}`);
                    reject(e);
                });

        } catch (e) {
            docketObject.name = "user_ExceptionOngetById";
            docketObject.keyDataAsJSON = `userObject id is ${id}`;
            docketObject.details = `caught Exception on user_getById ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

module.exports.getOne = (attribute, value) => {
    return new Promise((resolve, reject) => {
        try {
            if (attribute == null || value == null || typeof attribute === 'undefined' || typeof value === 'undefined') {
                throw new Error("IllegalArgumentException: attribute/value is null or undefined");
            }

            docketObject.name = "user_getOne";
            docketObject.keyDataAsJSON = `userObject ${attribute} with value ${value}`;
            docketObject.details = `user getOne initiated`;
            docketClient.postToDocket(docketObject);
            collection.findOne(attribute, value).then((data) => {
                if (data) {
                    debug(`user found ${data}`);
                    resolve(data);
                } else {
                    // return empty object in place of null
                    debug(`no user found by this ${attribute} ${value}`);
                    resolve({});
                }
            }).catch((e) => {
                debug(`failed to find ${e}`);
            });
        } catch (e) {
            docketObject.name = "user_ExceptionOngetOne";
            docketObject.keyDataAsJSON = `userObject ${attribute} with value ${value}`;
            docketObject.details = `caught Exception on user_getOne ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

module.exports.getMany = (attribute, value) => {
    return new Promise((resolve, reject) => {
        try {
            if (attribute == null || value == null || typeof attribute === 'undefined' || typeof value === 'undefined') {
                throw new Error("IllegalArgumentException: attribute/value is null or undefined");
            }

            docketObject.name = "user_getMany";
            docketObject.keyDataAsJSON = `userObject ${attribute} with value ${value}`;
            docketObject.details = `user getMany initiated`;
            docketClient.postToDocket(docketObject);
            collection.findMany(attribute, value).then((data) => {
                if (data) {
                    debug(`user found ${data}`);
                    resolve(data);
                } else {
                    // return empty object in place of null
                    debug(`no user found by this ${attribute} ${value}`);
                    resolve([]);
                }
            }).catch((e) => {
                debug(`failed to find ${e}`);
                reject(e);
            });
        } catch (e) {
            docketObject.name = "user_ExceptionOngetMany";
            docketObject.keyDataAsJSON = `userObject ${attribute} with value ${value}`;
            docketObject.details = `caught Exception on user_getMany ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

module.exports.authenticate = (credentials) => {
    return new Promise((resolve, reject) => {
        try {

            if (credentials == null || typeof credentials === 'undefined') {
                throw new Error("IllegalArgumentException:credentials is null or undefined");
            }
            collection.authenticate(credentials).then((data) => {
                debug(`Authentication successful ${data}`);
                resolve(data);
            }).catch((e) => {
                debug(`Authentication failed due to ${e}`);
                reject(e);
            });
        } catch (e) {
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

module.exports.updateToken = (id, token) => {
    return new Promise((resolve, reject) => {
        try {
            if (id == null || token == null) {
                throw new Error("IllegalArgumentException:id/token is null/undefined");
            }
            collection.updateToken(id, token).then((data) => {
                debug(`Token updated successfully ${data}`);
                resolve(data);
            }).catch((e) => {
                debug(`Token updation failed due to ${e}`);
                reject(e);
            });
        } catch (e) {
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};