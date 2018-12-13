const debug = require("debug")("evolvus-role:index");
const model = require("./model/roleSchema");
const _ = require('lodash');
const dbSchema = require("./db/roleSchema");
const shortid = require("shortid");
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const roleAudit = require("@evolvus/evolvus-docket-client").audit;
const application = require("@evolvus/evolvus-application");
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("role", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

roleAudit.application = "SANDSTORM_CONSOLE";
roleAudit.source = "ROLE_SERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};
module.exports.validate = (roleObject) => {
  debug(`index validate method.roleObject :${JSON.stringify(roleObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof roleObject === "undefined") {
        throw new Error("IllegalArgumentException:roleObject is undefined");
      }
      var res = validate(roleObject, schema);
      debug("validation status: ", JSON.stringify(res));
      if (res.valid) {
        resolve(res.valid);
      } else {
        reject(res.errors);
      }
    } catch (err) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId :${reference}`);
      reject(err);
    }
  });
};

// tenantId cannot be null or undefined, InvalidArgumentError
// check if tenantId is valid from tenant table (todo)
//
// createdBy can be "System" - it cannot be validated against users
// ipAddress is needed for docket, must be passed
//
// object has all the attributes except tenantId, who columns
module.exports.save = (tenantId, createdBy, ipAddress, accessLevel, entityId, roleObject) => {
  debug(`index save method,tenantId :${tenantId}, createdBy :${createdBy}, ipAddress :${ipAddress},accessLevel: ${accessLevel},entityId: ${entityId}, roleObject :${JSON.stringify(roleObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || roleObject == null) {
        throw new Error("IllegalArgumentException: tenantId/roleObject is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "roleName": roleObject.roleName.toUpperCase()
      };
      roleObject.roleName = roleObject.roleName.toUpperCase();
      Promise.all([application.find(tenantId, createdBy, ipAddress, {
        "applicationCode": roleObject.applicationCode
      }, {}, 0, 1), collection.find(query, {}, 0, 1)]).then((result) => {
        if (_.isEmpty(result[0])) {
          throw new Error(`No Application with ${roleObject.applicationCode} found`);
        }
        if (!_.isEmpty(result[1])) {
          throw new Error(`RoleName ${roleObject.roleName} already exists`);
        }
        roleAudit.name = "ROLE_SAVE";
        roleAudit.source = "ROLE_SERVICE";
        roleAudit.ipAddress = ipAddress;
        roleAudit.createdBy = createdBy;
        roleAudit.keyDataAsJSON = JSON.stringify(roleObject);
        roleAudit.eventDateTime = Date.now();
        roleAudit.status = "SUCCESS";
        roleAudit.details = `role creation initiated`;
        docketClient.postToDocket(roleAudit);
        let object = _.merge(roleObject, {
          "tenantId": tenantId
        });
        var res = validate(object, schema);
        debug("validation status: ", JSON.stringify(res));
        if (!res.valid) {
          if (res.errors[0].name == "required") {
            reject(`${res.errors[0].argument} is required`);
          } else {
            reject(res.errors);
          }
        } else {
          // if the object is valid, save the object to the database
          debug(`calling db save method, roleObject: ${JSON.stringify(roleObject)}`);
          object.roleName = object.roleName.toUpperCase();
          collection.save(object).then((result) => {
            debug(`saved successfully ${result}`);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "ROLE",
              "wfEntityAction": "CREATE",
              "createdBy": createdBy,
              "query": result._id
            };
            sweClient.initialize(sweEventObject).then((sweResult) => {
              var filterRole = {
                "tenantId": tenantId,
                "roleName": object.roleName
              };
              collection.update(filterRole, {
                "processingStatus": sweResult.data.wfInstanceStatus,
                "wfInstanceId": sweResult.data.wfInstanceId
              }).then((updateResult) => {
                resolve(result);
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`initialize update promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
            }).catch((e) => {
              var reference = shortid.generate();
              debug(`initialize promise failed due to :${e} and referenceId :${reference}`);
              reject(e);
            });
          }).catch((e) => {
            var reference = shortid.generate();
            debug(`failed to save promise due to : ${e},and reference: ${reference}`);
            reject(e);
          });
        }
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`promiseAll failed due to : ${e},and reference: ${reference}`);
        reject(e);
      });
      // Other validations here
    } catch (e) {
      var reference = shortid.generate();
      debug(`index save method, try_catch failure due to :${e} and referenceId :${reference}`);
      roleAudit.name = "ROLE_EXCEPTIONONSAVE";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = JSON.stringify(roleObject);
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "FAILURE";
      roleAudit.details = `caught Exception on role_save ${e.message}`;
      docketClient.postToDocket(roleAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


// tenantId should be valid
// createdBy should be requested user, not database object user, used for auditObject
// ipAddress should ipAddress
// filter should only have fields which are marked as filterable in the model Schema
// orderby should only have fields which are marked as sortable in the model Schema
module.exports.find = (tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit) => {
  debug(`index find method,tenantId :${tenantId},createdBy:${createdBy},ipAddress: ${ipAddress}, filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null) {
        throw new Error("IllegalArgumentException: tenantId is null or undefined");
      }
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      roleAudit.name = "ROLE_GETALL";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = `getAll with limit ${limit}`;
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "SUCCESS";
      roleAudit.details = `role getAll method`;
      docketClient.postToDocket(roleAudit);
      debug(`calling db find method, filter: ${JSON.stringify(filter)},orderby: ${orderby}, skipCount: ${skipCount},limit: ${limit}`);
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`role(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`find promise failed due to : ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`index find method, try_catch failure due to :${e} and referenceId :${reference}`);
      roleAudit.name = "ROLE_EXCEPTIONONGETALL";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = `getAll with limit ${limit}`;
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "FAILURE";
      roleAudit.details = `caught Exception on role_getAll ${e.message}`;
      docketClient.postToDocket(roleAudit);
      reject(e);
    }
  });
};

module.exports.update = (tenantId, createdBy, ipAddress, code, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy: ${createdBy},ipAddress: ${ipAddress}, code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "roleName": code.toUpperCase()
      };
      var filterRole = {
        "tenantId": tenantId,
        "roleName": code.toUpperCase()
      };
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`Role ${code.toUpperCase()}, not found `);
          }
          if ((!_.isEmpty(result[0])) && (result[0].roleName != code.toUpperCase())) {
            throw new Error(`Role ${update.roleName.toUpperCase()} already exists`);
          }
          roleAudit.name = "ROLE_UPDATE";
          roleAudit.source = "ROLE_SERVICE";
          roleAudit.ipAddress = ipAddress;
          roleAudit.createdBy = createdBy;
          roleAudit.keyDataAsJSON = JSON.stringify(update);
          roleAudit.eventDateTime = Date.now();
          roleAudit.status = "SUCCESS";
          roleAudit.details = `role updation initiated`;
          docketClient.postToDocket(roleAudit);
          debug(`calling db update method, filterRole: ${JSON.stringify(filterRole)},update: ${JSON.stringify(update)}`);
          collection.update(filterRole, update).then((resp) => {
            debug("updated successfully", resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "ROLE",
              "wfEntityAction": "UPDATE",
              "createdBy": createdBy,
              "query": result[0]._id,
              "object": result[0]
            };
            sweClient.initialize(sweEventObject).then((result) => {
              collection.update(filterRole, {
                "processingStatus": result.data.wfInstanceStatus,
                "wfInstanceId": result.data.wfInstanceId
              }).then((result) => {
                debug("updated successfully", result);
                resolve(result);
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`initialize update promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
            }).catch((e) => {
              var reference = shortid.generate();
              debug(`initialize promise failed due to :${e} and referenceId :${reference}`);
              reject(e);
            });
          }).catch((error) => {
            var reference = shortid.generate();
            debug(`update promise failed due to ${error}, and reference Id :${reference}`);
            reject(error);
          });
        }).catch((error) => {
          var reference = shortid.generate();
          debug(`find promise failed due to ${error}, and reference Id :${reference}`);
          reject(error);
        });
    } catch (e) {
      var reference = shortid.generate();
      roleAudit.name = "ROLE_EXCEPTIONONUPDATE";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = JSON.stringify(update);
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "FAILURE";
      roleAudit.details = `caught Exception on role_update ${e.message}`;
      docketClient.postToDocket(roleAudit);
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy: ${createdBy},ipAddress: ${ipAddress}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
      roleAudit.name = "ROLE_UPDATEWORKFLOW";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = JSON.stringify(update);
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "SUCCESS";
      roleAudit.details = `role workflow updation initiated`;
      docketClient.postToDocket(roleAudit);
      debug(`calling db update method, filterRole: ${JSON.stringify(filterRole)},update: ${JSON.stringify(update)}`);
      collection.update(filterRole, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      roleAudit.name = "ROLE_EXCEPTIONON_UPDATEWORKFLOW";
      roleAudit.source = "ROLE_SERVICE";
      roleAudit.ipAddress = ipAddress;
      roleAudit.createdBy = createdBy;
      roleAudit.keyDataAsJSON = JSON.stringify(update);
      roleAudit.eventDateTime = Date.now();
      roleAudit.status = "FAILURE";
      roleAudit.details = `caught Exception on role_updateWorkflow ${e.message}`;
      docketClient.postToDocket(roleAudit);
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};