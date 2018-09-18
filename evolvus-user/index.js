const debug = require("debug")("evolvus-user:index");
const model = require("./model/userSchema");
const dbSchema = require("./db/userSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = require("@evolvus/evolvus-docket-client").audit;
const entity = require("@evolvus/evolvus-entity");
const role = require("@evolvus/evolvus-role");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
var date = require("date-and-time");

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("user", dbSchema);
const sweClient = require("@evolvus/evolvus-swe-client");

var format = "DDMMYYYYHHmmssSS";

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

audit.application = "SANDSTORM_CONSOLE";
audit.source = "USER";

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
      audit.name = "USER_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(userObject);
      audit.details = `user save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
            Promise.all([entity.find(tenantId, createdBy, ipAddress, object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED") {
                      object.role = result[1][0];
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
                                "tenantId": tenantId,
                                "userId": result.userId
                              };
                              debug(`calling db update filterUser :${JSON.stringify(filterUser)} is a parameter`);
                              collection.update(filterUser, {
                                "processingStatus": sweResult.data.wfInstanceStatus,
                                "wfInstanceId": sweResult.data.wfInstanceId
                              }).then((userObject) => {
                                debug(`collection.update:user updated with workflow status and id:${JSON.stringify(userObject)}`);
                                resolve(savedObject);
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
      audit.name = "USER_EXCEPTION_ON_SAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(userObject);
      audit.details = `caught Exception on user_save ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
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
      audit.name = "USER_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `getAll with filter ${JSON.stringify(filter)}`;
      audit.details = `user getAll method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
          return _.omit(object.toJSON(), "userPassword", "token", "saltString");
        });
        debug(`Number of User(s) stored in the database are ${filteredArray.length}`);
        resolve(filteredArray);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`collection.find promise failed due to ${e} and reference id ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      audit.name = "USER_EXCEPTION_ON_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `getAll with filter ${JSON.stringify(filter)}`;
      audit.details = `caught Exception on user_getAll ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
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
      audit.name = "USER_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with  ${JSON.stringify(object)}`;
      audit.details = `user update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
            Promise.all([entity.find(tenantId, createdBy, ipAddress, object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED") {
                      object.role = result[1][0];
                      object.applicationCode = result[1][0].applicationCode;
                      collection.update(filterUser, object).then((result) => {
                        debug(`User updated successfully ${JSON.stringify(result)}`);
                        var sweEventObject = {
                          "tenantId": tenantId,
                          "wfEntity": "USER",
                          "wfEntityAction": "UPDATE",
                          "createdBy": createdBy,
                          "query": user[0]._id,
                          "object": user[0]
                        };

                        debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                        sweClient.initialize(sweEventObject).then((sweResult) => {
                          var filterUser = {
                            "tenantId": tenantId,
                            "userId": user[0].userId
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
      audit.name = "USER_EXCEPTION_ON_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with object ${JSON.stringify(object)}`;
      audit.details = `caught Exception on user_update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};


module.exports.updateWorkflow = (tenantId, ipAddress, createdBy, id, update) => {
  debug(`index update method: tenantId :${tenantId}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/id/update is null or undefined");
      }
      audit.name = "USER_WORKFLOW_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with  ${JSON.stringify(update)}`;
      audit.details = `user update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
      audit.name = "USER_EXCEPTION_ON_WORKFLOWUPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with object ${JSON.stringify(update)}`;
      audit.details = `caught Exception on user_update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
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
      if (credentials.userName != null) {
        credentials.userName = credentials.userName.toUpperCase();
      }
      let query = {
        "userId": credentials.userName,
        "enabledFlag": "true",
        "activationStatus":"ACTIVE",
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

module.exports.saveUser = (tenantId, ipAddress, createdBy, accessLevel, userObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || userObject == null) {
        throw new Error("IllegalArgumentException: tenantId/userObject is null or undefined");
      }
      if (userObject.userName == null) {
        userObject.userName = userObject.userId;
      }
      let now = new Date();
      let id = date.format(now, format);
      let object = _.merge(userObject, {
        "tenantId": tenantId,
        "processingStatus": "AUTHORIZED",
        "uniquereferenceid": id
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
            Promise.all([entity.find(tenantId, createdBy, ipAddress, object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED" && result[1][0].activationStatus === "ACTIVE" ) {
                      object.role = result[1][0];
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
                            resolve(savedObject);
                          }).catch((e) => {
                            var reference = shortid.generate();
                            debug(`collection.save promise failed due to ${e} and reference id ${reference}`);
                            reject(e);
                          });
                        });
                      });
                    } else {
                      debug(`User save failed due to selected Role ${object.role.roleName} not AUTHORIZED`);
                      reject(`Role ${object.role.roleName} must be ACTIVE and AUTHORIZED`);
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
      reject(e);
    }
  });
};

module.exports.updateUser = (tenantId, createdBy, ipAddress, userId, object, accessLevel) => {
  debug(`index update method: tenantId:${tenantId},userId:${userId},object:${JSON.stringify(object)},accessLevel:${accessLevel} are input paramaters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || userId == null) {
        throw new Error("IllegalArgumentException:tenantId/userId is null or undefined");
      }
      audit.name = "USER_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with  ${JSON.stringify(object)}`;
      audit.details = `user update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      userId = userId.toUpperCase();
      if (object.role != null) {
        object.role = {
          roleName: object.role
        }
      }
      var filterUser = {
        "userId": userId,
        "tenantId": tenantId,
        "accessLevel": {
          $gte: accessLevel
        }
      };
      object.contact={};
      if (object.emailId != null) {
        object.contact.emailId = object.emailId
      }
      var result;
      var errors = [];
      _.mapKeys(object, function(value, key) {
        if (schema.properties[key] != null) {
          result = validate(value, schema.properties[key]);
          if (result.errors.length != 0) {
            result.errors[0].property=key;
            errors.push(result.errors);
          }
        }
      });
      debug("Validation status: ", JSON.stringify(result));
      if (errors.length != 0 && errors[0][0].name == "format") {
        reject(errors[0][0].stack);
      } else if (errors.length != 0) {
        reject(errors[0]);
      } else {
        // Other validations here
        collection.find(filterUser, {}, 0, 1).then((user) => {
          if (user.length != 0) {
            if (object.entityId == null) {
              object.entityId = user[0].entityId;
            }
            if (object.role == null) {
              object.role = user[0].role;
            }
            var filterEntity = {
              entityId: object.entityId.toUpperCase()
            };
            var filterRole = {
              roleName: object.role.roleName.toUpperCase()
            };
            Promise.all([entity.find(tenantId, createdBy, ipAddress, object.entityId, accessLevel, filterEntity, {}, 0, 1), role.find(tenantId, createdBy, ipAddress, filterRole, {}, 0, 1)])
              .then((result) => {
                if (result[0].length != 0) {
                  object.accessLevel = result[0][0].accessLevel;
                  if (result[1].length != 0) {
                    if (result[1][0].processingStatus === "AUTHORIZED" && result[1][0].activationStatus === "ACTIVE" ) {
                      object.role = result[1][0];
                      object.applicationCode = result[1][0].applicationCode;
                      object.contact = user[0].contact;
                      if (object.emailId != null) {
                        object.contact.emailId = object.emailId
                      }
                      let now = new Date();
                      let id = date.format(now, format);
                      object.uniquereferenceid = id;
                      collection.update(filterUser, object).then((result) => {
                        debug(`User updated successfully ${JSON.stringify(result)}`);
                        result.id = id;
                        resolve(result);
                      }).catch((e) => {
                        var reference = shortid.generate();
                        debug(`Collection.update promise failed due to ${e} and reference id ${reference}`);
                        reject(e);
                      });
                    } else {
                      debug(`User update failed due to selected Role ${object.role.roleName} not AUTHORIZED`);
                      reject(`Role ${object.role.roleName} must be ACTIVE and AUTHORIZED`);
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
      audit.name = "USER_EXCEPTION_ON_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update user with object ${JSON.stringify(object)}`;
      audit.details = `caught Exception on user_update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};

module.exports.activate = (userId, action) => {
  return new Promise((resolve, reject) => {
    try {
      action = action.toUpperCase();
      if (action === "ACTIVE" || action === "INACTIVE") {
        let flag = "false";
        var filterUser = {
          "userId": userId.toUpperCase()
        };
        if (action == "ACTIVE") {
          flag = "true";
        }
        let now = new Date();
        let id = date.format(now, format);
        var updateUser = {
          "activationStatus": action,
          "enabledFlag": flag,
          "uniquereferenceid": id
        };
        collection.findOne(filterUser).then((user) => {
          if (user) {
            if (user.activationStatus == action) {
              let result = {
                data: `User is already ${action}`,
                id: null
              };
              resolve(result);
            } else {
              collection.update(filterUser, updateUser).then((result) => {
                if (result.nModified == 1) {
                  if (action == "ACTIVE") {
                    result.data = `User ${userId} activated successfullly`;
                    result.id = id;
                    resolve(result);
                  } else {
                    result.data = `User ${userId} deactivated successfullly`;
                    result.id = id;
                    resolve(result);
                  }
                } else {
                  reject("Not able to modify User");
                }
              }).catch((e) => {
                reject(e);
              });
            }
          } else {
            reject(`No User found matching the id ${userId}`);
          }
        }).catch((e) => {
          reject(e);
        });
      } else {
        reject("Action value must be ACTIVE or INACTIVE");
      }

    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
      reject(e);
    }
  });
};

module.exports.authorize = (credentials) => {
  debug(`index authorize method: Input parameters are ${JSON.stringify(credentials)}`);
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
        "tenantId": credentials.corporateId,
        "enabledFlag": "true",
        "activationStatus": "ACTIVE",
        "role.roleName": credentials.roleId.toUpperCase(),
        "processingStatus": "AUTHORIZED"
      };
      collection.findOne(query)
        .then((userObj) => {
          if (userObj) {
            debug(`user object found with input credentials:${JSON.stringify(credentials)} is ${JSON.stringify(userObj.userId)}`);
            var userObject = _.omit(userObj.toJSON(), ["userPassword", "saltString", "token"]);
            debug("Index authorize method:Authorization successful for user: ", userObject.userId);
            resolve(userObject);
          } else {
            debug(`Index authorize method:Authorization failed due to Invalid credentials`);
            reject("Index authorize method:Authorization failed due to Invalid credentials");
          }
        }, (err) => {
          debug(`Failed to authorize due to ${err}`);
          reject(`Failed to authorize due to ${err}`);
        })
        .catch((e) => {
          console.log(e);
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