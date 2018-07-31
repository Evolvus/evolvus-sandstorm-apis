const debug = require("debug")("evolvus-user:index");
const model = require("./model/userSchema");
const dbSchema = require("./db/userSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const entity = require("@evolvus/evolvus-entity");
const role = require("@evolvus/evolvus-role");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("user", dbSchema);

const sweClient = require("@evolvus/evolvus-swe-client");


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
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (userObject) => {
  debug(`index validate method,userObject :${JSON.stringify(userObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof userObject == null) {
        throw new Error(`IllegalArgumentException:userObject is ${userObject}`);
      }
      var res = validate(userObject, schema);
      debug("Validation status: ", JSON.stringify(res));
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
module.exports.save = (tenantId, ipAddress, createdBy, accessLevel, userObject) => {
  debug(`index save method:tenantId :${tenantId}, createdBy:${createdBy}, ipAddress:${ipAddress},accessLevel:${accessLevel}, userObject:${JSON.stringify(userObject)} are parameters)`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || userObject == null) {
        throw new Error("IllegalArgumentException: tenantId/userObject is null or undefined");
      }
      docketObject.name = "user_save";
      docketObject.ipAddress = ipAddress;
      docketObject.createdBy = createdBy;
      docketObject.keyDataAsJSON = JSON.stringify(userObject);
      docketObject.details = `user creation initiated`;
      docketClient.postToDocket(docketObject);
      let object = _.merge(userObject, {
        "tenantId": tenantId
      });
      var res = validate(object, schema);

      debug("Validation status: ", JSON.stringify(res));
      if (!res.valid) {
        if (res.errors[0].name === 'required') {
          reject(`${res.errors[0].argument} is Required`);
        } else {
          reject(res.errors[0].stack);
        }
      } else {
        // Other validations here
        object.userId = object.userId.toUpperCase();
        let query = {
          userId: object.userId
        };
        collection.findOne(query).then((userObject) => {
          if (userObject) {
            reject(`UserId ${object.userId} already exists`);
          } else {
            var filterEntity = {
              entityId: object.entityId.toUpperCase()
            };
            var filterRole = {
              roleName: object.role.roleName.toUpperCase()
            };
            Promise.all([entity.find(tenantId,createdBy, ipAddress, object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED") {
                      object.applicationCode = result[1][0].applicationCode;
                      bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(object.userPassword, salt, function(err, hash) {
                          // Assign hashedPassword to your userPassword and salt to saltString ,store it in DB.
                          object.userPassword = hash;
                          object.saltString = salt;
                          debug("calling dao save method and parameter is object ", object);
                          collection.save(object).then((result) => {
                            var savedObject = _.omit(result.toJSON(), 'userPassword', 'token', 'saltString');
                            debug(`User saved successfully ${savedObject}`);
                            var sweEventObject = {
                              "tenantId": tenantId,
                              "wfEntity": "USER",
                              "wfEntityAction": "CREATE",
                              "createdBy": createdBy,
                              "query": result._id
                            };

                            debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                            sweClient.initialize(sweEventObject).then((sweResult) => {
                              var filterUser = {
                                "userId": result.userId
                              };
                              debug(`calling db update filterUser :${JSON.stringify(filterUser)} is a parameter`);
                              collection.update(filterUser, {
                                "processingStatus": sweResult.data.wfInstanceStatus,
                                "wfInstanceId": sweResult.data.wfInstanceId
                              }).then((userObject) => {
                                debug(`collection.update:user updated with workflow status and id:${JSON.stringify(userObject)}`);
                                resolve(userObject);
                              }).catch((e) => {
                                var reference = shortid.generate();
                                debug(`collection.update promise failed due to :${e} and referenceId :${reference}`);
                                reject(e);
                              });
                            }).catch((e) => {
                              var reference = shortid.generate();
                              debug(`sweClient.initialize promise failed due to :${e} and referenceId :${reference}`);
                              reject(e);
                            });
                          }).catch((e) => {
                            var reference = shortid.generate();
                            debug(`collection.save promise failed due to ${e} and reference id ${reference}`);
                            reject(e);
                          });
                        });
                      });
                    } else {
                      debug(`User save failed due to selected Role ${object.role.roleName} not AUTHORIZED`);
                      reject(`Role ${object.role.roleName} must be AUTHORIZED`);
                    }
                  } else {
                    debug(`User save failed due to the Role ${object.role.roleName} which is assigned to user not found`);
                    reject(`Role ${object.role.roleName} not found`);
                  }
                } else {
                  debug("User save failed due the selected Entity not found");
                  reject(`User save failed due the selected Entity not found`);
                }
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`entity.find promise failed due to ${e} and reference id ${reference}`);
                reject(e);
              });
          }
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`user.find promise failed due to ${e} and reference id ${reference}`);
          reject(e);
        });
      }
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      docketObject.name = "user_ExceptionOnSave";
      docketObject.ipAddress = ipAddress;
      docketObject.createdBy = createdBy;
      docketObject.keyDataAsJSON = JSON.stringify(userObject);
      docketObject.details = `caught Exception on user_save ${e.message}`;
      docketClient.postToDocket(docketObject);
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
  debug(`index find method:tenantId:${tenantId},entityId:${entityId},accessLevel:${accessLevel},createdBy:${createdBy},ipAddress:${ipAddress},filter:${JSON.stringify(filter)},orderby:${JSON.stringify(orderby)},skipCount:${skipCount},limit:${limit} are input parameters`);
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
      let query = _.merge(filter, {
        "tenantId": tenantId,
        "accessLevel": {
          $gte: accessLevel
        },
        "entityId": {
          $regex: entityId + ".*"
        }
      });
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        let filteredArray = _.map(docs, function(object) {
          return _.omit(object, "userPassword", "token", "saltString");
        });
        debug(`User(s) stored in the database are ${filteredArray}`);
        resolve(filteredArray);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`collection.find promise failed due to ${e} and reference id ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      docketObject.name = "user_ExceptionOngetAll";
      docketObject.ipAddress = ipAddress;
      docketObject.createdBy = createdBy;
      docketObject.keyDataAsJSON = "userObject";
      docketObject.details = `caught Exception on user_getAll ${e.message}`;
      docketClient.postToDocket(docketObject);
      reject(e);
    }
  });
};


// tenantId should be valid
module.exports.update = (tenantId, createdBy, ipAddress, userId, object, accessLevel, entityId) => {
  debug(`index update method: tenantId:${tenantId},userId:${userId},object:${JSON.stringify(object)},accessLevel:${accessLevel},entityId:${entityId} are input paramaters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || userId == null) {
        throw new Error("IllegalArgumentException:tenantId/userId is null or undefined");
      }
      userId = userId.toUpperCase();
      var filterUser = {
        "userId": userId,
        "tenantId": tenantId,
        "entityId": {
          $regex: entityId + ".*"
        },
        "accessLevel": {
          $gte: accessLevel
        }
      };
      var result;
      var errors = [];
      _.mapKeys(object, function(value, key) {
        if (schema.properties[key] != null) {
          result = validate(value, schema.properties[key]);
          if (result.errors.length != 0) {
            errors.push(result.errors);
          }
        }
      });
      debug("Validation status: ", JSON.stringify(result));
      if (errors.length != 0) {
        reject(errors[0][0].stack);
      } else {
        // Other validations here
        collection.find(filterUser, {}, 0, 1).then((user) => {
          if (user.length != 0) {
            if (object.entityId == null) {
              object.entityId = user[0].entityId;
            }
            if (object.role == null || object.role.roleName == null) {
              object.role = user[0].role;
            }
            var filterEntity = {
              entityId: object.entityId.toUpperCase()
            };
            var filterRole = {
              roleName: object.role.roleName.toUpperCase()
            };
            Promise.all([entity.find(tenantId, createdBy, ipAddress,object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED") {
                      console.log("OBJECT", object);
                      collection.update(filterUser, object).then((result) => {
                        debug(`User updated successfully ${JSON.stringify(result)}`);
                        var sweEventObject = {
                          "tenantId": tenantId,
                          "wfEntity": "USER",
                          "wfEntityAction": "UPDATE",
                          "createdBy": createdBy,
                          "query":user[0]._id
                        };

                        debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                        sweClient.initialize(sweEventObject).then((sweResult) => {
                          var filterUser = {
                            "userId": result.userId
                          };
                          debug(`calling db update filterUser :${JSON.stringify(filterUser)} is a parameter`);
                          collection.update(filterUser, {
                            "processingStatus": sweResult.data.wfInstanceStatus,
                            "wfInstanceId": sweResult.data.wfInstanceId
                          }).then((userObject) => {
                            debug(`collection.update:user updated with workflow status and id:${JSON.stringify(userObject)}`);
                            resolve(userObject);
                          }).catch((e) => {
                            var reference = shortid.generate();
                            debug(`collection.update promise failed due to :${e} and referenceId :${reference}`);
                            reject(e);
                          });
                        }).catch((e) => {
                          var reference = shortid.generate();
                          debug(`sweClient.initialize promise failed due to :${e} and referenceId :${reference}`);
                          reject(e);
                        });
                      }).catch((e) => {
                        var reference = shortid.generate();
                        debug(`Collection.update promise failed due to ${e} and reference id ${reference}`);
                        reject(e);
                      });
                    } else {
                      debug(`User update failed due to selected Role ${object.role.roleName} not AUTHORIZED`);
                      reject(`Role ${object.role.roleName} must be AUTHORIZED`);
                    }
                  } else {
                    debug(`User update failed due to the Role ${object.role.roleName} which is assigned to user not found`);
                    reject(`Role ${object.role.roleName} not found`);
                  }
                } else {
                  debug("User update failed due the selected Entity not found");
                  reject(`User update failed due the selected Entity not found`);
                }
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`Collection.update promise failed due to ${e} and reference id ${reference}`);
                reject(e);
              });
          } else {
            debug("No user found matching the userId " + userId);
            reject("No user found matching the userId " + userId);
          }
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`user.find promise failed due to ${e} and reference id ${reference}`);
          reject(e);
        });
      }
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};


module.exports.updateWorkflow = (tenantId, id, update) => {
  debug(`index update method: tenantId :${tenantId}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filterUser = {
        "tenantId": tenantId,
        "_id": id
      };
      debug(`calling db update method, filterUser: ${JSON.stringify(filterUser)},update: ${JSON.stringify(update)}`);
      collection.update(filterUser, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};


//Authenticate User credentials {userId,userPassword,application}
module.exports.authenticate = (credentials) => {
  debug(`index authenticate method: Input parameters are ${JSON.stringify(credentials)}`);
  return new Promise((resolve, reject) => {
    try {
      if (credentials == null || typeof credentials === 'undefined') {
        throw new Error("IllegalArgumentException:Input credentials is null or undefined");
      }
      if (credentials.userId != null) {
        credentials.userId = credentials.userId.toUpperCase();
      }
      let query = {
        "userId": credentials.userId,
        "enabledFlag": 1,
        "applicationCode": credentials.applicationCode,
        "processingStatus": "AUTHORIZED"
      };
      collection.findOne(query)
        .then((userObj) => {
          debug(`user object found with input credentials:${JSON.stringify(credentials)} is ${JSON.stringify(userObj)}`);
          if (userObj) {
            bcrypt.hash(credentials.userPassword, userObj.saltString, (err, hash) => {
              if (hash === userObj.userPassword) {
                var userObject = _.omit(userObj.toJSON(), ["userPassword", "saltString", "token"]);
                debug("Index authenticate method:Authentication successful for user: ", userObject.userName);
                resolve(userObject);
              } else {
                debug(`Index authenticate method:Authentication failed due to invalid Password:${credentials.userPassword}`);
                reject(`Authentication failed due to invalid Password:${credentials.userPassword}`);
              }
            });
          } else {
            debug(`Index authenticate method:Authentication failed due to Invalid username/password`);
            reject("Invalid username/password");
          }
        }, (err) => {
          debug(`Failed to authenticate due to ${err}`);
          reject(`Failed to authenticate due to ${err}`);
        })
        .catch((e) => {
          var reference = shortid.generate();
          debug(`collection.findOne promise failed due to ${e} and reference id ${reference}`);
          reject(e);
        });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};

module.exports.updateToken = (id, token) => {
  return new Promise((resolve, reject) => {
    try {
      if (id == null || token == null) {
        throw new Error(`IllegalArgumentException:id/token is null or undefined`);
      }
      let filter = {
        "_id": id
      };
      var update = {
        token: token
      };
      collection.update(filter, update).then((result) => {
        if (result.nModified == 1) {
          debug(`Index updatedToken method: Token updated successfully ${result}`);
          resolve(result);
        } else {
          debug(`Index updatedToken method:Failed to update token.`);
          reject("Index updatedToken method:Failed to update token.");
        }
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`collection.update promise failed due to ${e} and reference id ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};