const debug = require("debug")("evolvus-user:index");
const model = require("./model/userSchema");
const db = require("./db/userSchema");
const _ = require('lodash');
const collection = require("./db/user");
const validate = require("jsonschema").validate;
const docketClient = require("evolvus-docket-client");
const entity = require('evolvus-entity');


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

module.exports.validate = (userObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof userObject == null) {
        throw new Error(`IllegalArgumentException:userObject is ${userObject}`);
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
module.exports.save = (tenantId, ipAddress, createdBy, accessLevel, object) => {
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
      var res = validate(object, schema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        if (res.errors[0].name === 'required') {
          reject(`${res.errors[0].argument} is Required`);
        } else {
          reject(res.errors[0].stack);
        }
      } else {
        // Other validations here
        object.userId = object.userId.toUpperCase();
        collection.findOne(tenantId, {
          userId: object.userId
        }).then((userObject) => {
          if (userObject) {
            reject(`userId ${object.userId} already exists`);
          } else {
            var filter = {
              entityId: object.entityId
            };
            entity.find(tenantId, object.entityId, accessLevel, filter, {}, 0, 1).then((entityObject) => {
              if (!entityObject.length == 0) {
                object.accessLevel = entityObject[0].accessLevel;
                // if the object is valid, saapplicationve the object to the database
                collection.save(tenantId, object).then((result) => {
                  debug(`user saved successfully ${result}`);
                  resolve(result);
                }).catch((e) => {
                  debug(`failed to save with an error: ${e}`);
                  reject(e);
                });
              } else {
                reject(`There is no entity matching this entityId ${object.entityId}`);
              }
            }).catch((e) => {
              debug(`failed to save with an error: ${e}`);
              reject(e);
            });
          }
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


module.exports.find = (tenantId, entityId, accessLevel, createdBy, ipAddress, filter, orderby, skipCount, limit) => {
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null) {
        throw new Error("IllegalArgumentException: tenantId is null or undefined");
      }
      docketObject.name = "user_getAll";
      docketObject.ipAddress = ipAddress;
      docketObject.createdBy = createdBy;
      docketObject.keyDataAsJSON = `getAll with limit ${limit}`;
      docketObject.details = `user getAll method`;
      docketClient.postToDocket(docketObject);

      collection.find(tenantId, entityId, accessLevel, filter, orderby, skipCount, limit).then((docs) => {
        debug(`user(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        debug(`failed to find all the user(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      docketObject.name = "user_ExceptionOngetAll";
      docketObject.ipAddress = ipAddress;
      docketObject.createdBy = createdBy;
      docketObject.keyDataAsJSON = "userObject";
      docketObject.details = `caught Exception on user_getAll ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


// tenantId should be valid
module.exports.update = (tenantId, userId, object, accessLevel) => {
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || userId == null) {
        throw new Error("IllegalArgumentException:tenantId/userName is null or undefined");
      }
      userId = userId.toUpperCase();
      var res = validate(object, schema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        if (res.errors[0].name === 'required') {
          reject(`${res.errors[0].argument} is Required`);
        } else {
          reject(res.errors[0].stack);
        }
      } else {
        // Other validations here
        var filter = {
          entityId: object.entityId
        };
        entity.find(tenantId, object.entityId, accessLevel, filter, {}, 0, 1).then((entityObject) => {
          if (!entityObject.length == 0) {
            object.accessLevel = entityObject[0].accessLevel;
            // if the object is valid, saapplicationve the object to the database
            collection.update(tenantId, userId, object).then((result) => {
              debug(`user saved successfully ${result}`);
              resolve(result);
            }).catch((e) => {
              debug(`failed to save with an error: ${e}`);
              reject(e);
            });
          } else {
            reject(`There is no entity matching this entityId ${object.entityId}`);
          }
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
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