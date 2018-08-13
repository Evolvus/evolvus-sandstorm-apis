const debug = require("debug")("evolvus-entity:index");
const model = require("./model/entitySchema");
const dbSchema = require("./db/entitySchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const audit = require("@evolvus/evolvus-docket-client").audit;
const randomString = require("randomstring");
const sweClient = require("@evolvus/evolvus-swe-client");
const shortid = require("shortid");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("entity", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

audit.application = "SANDSTORM_CONSOLE";
audit.source = "ENTITY";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (tenantId, entityObject) => {
  debug(`index validate method.entityObject :${JSON.stringify(entityObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof entityObject === "undefined") {
        throw new Error("IllegalArgumentException:entityObject is undefined");
      }
      let result = _.merge(entityObject, {
        "tenantId": tenantId
      });
      var res = validate(result, schema);
      debug("validation status: ", JSON.stringify(res));
      if (res.valid) {
        resolve(res.valid);
      } else {
        reject(res.errors);
      }
    } catch (err) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${err} and referenceId :${reference}`);
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
module.exports.save = (tenantId, createdBy, ipAddress, entityId, accessLevel, object) => {
  debug(`index save method,tenantId :${tenantId}, createdBy : ${createdBy}, ipAddress : ${ipAddress},entityId :${entityId},accessLevel :${accessLevel}, object :${JSON.stringify(object)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof object === 'undefined' || object == null) {
        throw new Error("IllegalArgumentException: object is null or undefined");
      }
      audit.name = "ENTITY_SAVE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(object);
      audit.details = `entity save is initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      let entityObject = _.merge(object, {
        "tenantId": tenantId
      });
      let query = ({
        "tenantId": tenantId
      });
      query.accessLevel = {
        $gte: accessLevel
      };
      query.entityId = {
        $regex: entityId + ".*"
      };
      var res = validate(entityObject, schema);
      if (!res.valid) {
        if (res.errors[0].name == "required") {
          reject(`${res.errors[0].argument} is required`);
        }
        if (res.errors[0].name == "enum") {
          reject(`${res.errors[0].stack} `);
        }
        if (res.errors[0].name == "type") {
          reject(`${res.errors[0].stack} `);
        } else {
          reject(res.errors[0].stack);
        }
      } else {
        debug("validation status: ", JSON.stringify(res));
        let query1 = _.merge(query, {
          "name": entityObject.parent
        });

        debug(`calling db find query1 :${JSON.stringify(query1)}, orderby:${{}},skipCount:${0},limit:${1} are parameters`);
        collection.find(query1, {}, 0, 1).then((result) => {
          if (_.isEmpty(result)) {
            throw new Error(`No ParentEntity found with ${entityObject.parent}`);
          }
          var randomId = randomString.generate(5);
          if (result[0].enableFlag == "true") {
            var aces = parseInt(result[0].accessLevel) + 1;
            entityObject.accessLevel = JSON.stringify(aces);
            entityObject.entityId = result[0].entityId + randomId;
            entityObject.name = entityObject.name.toUpperCase();
            entityObject.entityCode = entityObject.entityCode.toUpperCase();
            let query2 = {
              "tenantId": tenantId,
              "entityId": {
                $regex: entityId + ".*"
              },
              "accessLevel": {
                $gte: accessLevel
              },
              "name": entityObject.name,
            };
            let query3 = {
              "tenantId": tenantId,
              "entityId": {
                $regex: entityId + ".*"
              },
              "accessLevel": {
                $gte: accessLevel
              },
              "entityCode": entityObject.entityCode
            };
            debug(`calling db find query2 :${JSON.stringify(query2)}, orderby:${{}},skipCount:${0},limit:${1} are parameters`);
            debug(`calling db find query3 :${JSON.stringify(query3)}, orderby:${{}},skipCount:${0},limit:${1} are parameters`);
            Promise.all([collection.find(query2, {}, 0, 1), collection.find(query3, {}, 0, 1)])
              .then((result) => {
                if (!_.isEmpty(result[0][0])) {
                  throw new Error(`Entity Name ${entityObject.name} already exists`);
                }
                if (!_.isEmpty(result[1][0])) {
                  throw new Error(`Entity Code ${entityObject.entityCode} already exists`);
                }
                // if the object is valid, save the object to the database
                debug(`calling db save entityObject :${JSON.stringify(entityObject)} is a parameter`);
                collection.save(entityObject).then((result) => {
                  debug(`saved successfully ${result}`);
                  var sweEventObject = {
                    "tenantId": tenantId,
                    "wfEntity": "ENTITY",
                    "wfEntityAction": "CREATE",
                    "createdBy": createdBy,
                    "query": result._id
                  };
                  debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
                  sweClient.initialize(sweEventObject).then((result) => {
                    var filterEntity = {
                      "tenantId": tenantId,
                      "entityCode": entityObject.entityCode
                    };
                    debug(`calling db update  filterEntity :${JSON.stringify(filterEntity)} is a parameter`);
                    collection.update(filterEntity, {
                      "processingStatus": result.data.wfInstanceStatus,
                      "wfInstanceId": result.data.wfInstanceId
                    }).then((result) => {
                      resolve(result);
                    }).catch((e) => {
                      var reference = shortid.generate();
                      debug(`update promise failed due to :${e} and referenceId :${reference}`);
                      reject(e);
                    });
                  }).catch((e) => {
                    var reference = shortid.generate();
                    debug(`initialize promise failed due to :${e} and referenceId :${reference}`);
                    reject(e);
                  });
                }).catch((e) => {
                  var reference = shortid.generate();
                  debug(`collection entity save promise failed due to :${e} and referenceId :${reference}`);
                  reject(e);
                });
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`collection find promiseAll failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
          } else {
            throw new Error(`ParentEntity is disabled`);
          }
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`collection find promise failed due to :${e} and referenceId :${reference}`);
          reject(e);
        });
      }
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId :${reference}`);
      audit.name = "ENTITY_EXCEPTION_ON_SAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(object);
      audit.details = `caught Exception on entity_save ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      reject(e);
    }
  });
};
// tenantId should be valid
// createdBy should be requested user, not database object user, used for auditObject
// ipAddress should ipAddress
// filter should only have fields which are marked as filterable in the model Schema
// orderby should only have fields which are marked as sortable in the model Schema
module.exports.find = (tenantId, createdBy, ipAddress, entityId, accessLevel, filter, orderby, skipCount, limit) => {
  debug(`index find method,tenantId :${tenantId},createdBy : ${createdBy}, ipAddress : ${ipAddress},entityId :${entityId},accessLevel :${accessLevel},  filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null) {
        throw new Error("IllegalArgumentException: tenantId is null or undefined");
      }
      audit.name = "ENTITY_FIND INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `getAll with filter ${JSON.stringify(filter)}`;
      audit.details = `entity getAll method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      query.accessLevel = {
        $gte: accessLevel
      };
      query.entityId = {
        $regex: entityId + ".*"
      };
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`entity(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`collection find promise failed due to :${e} and referenceId :${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId :${reference}`);
      audit.name = "ENTITY_EXCEPTION_ON_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `getAll with filter ${JSON.stringify(filter)}`;
      audit.details = `caught Exception on Entity_getAll ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      reject(e);
    }
  });
};

// tenantId should be valid
module.exports.update = (tenantId, createdBy, ipAddress, code, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy : ${createdBy}, ipAddress : ${ipAddress}, code :${code}, update :${JSON.stringify(update)}, are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      audit.name = "ENTITY_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update entity with  ${JSON.stringify(update)}`;
      audit.details = `entity update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      let query = {
        "tenantId": tenantId,
        "entityCode": code
      };
      collection.find(query, {}, 0, 1).then((result) => {
        if (result.length != 0) {
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "ENTITY",
              "wfEntityAction": "UPDATE",
              "createdBy": createdBy,
              "query": result[0]._id,
              "object": result[0]
            };
            debug(`calling sweClient initialize .sweEventObject :${JSON.stringify(sweEventObject)} is a parameter`);
            sweClient.initialize(sweEventObject).then((result) => {
              debug(`calling db update query :${JSON.stringify(query)} is a parameter`);
              collection.update(query, {
                "processingStatus": result.data.wfInstanceStatus,
                "wfInstanceId": result.data.wfInstanceId
              }).then((result) => {
                resolve(result);
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`update promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
            }).catch((e) => {
              var reference = shortid.generate();
              debug(`initialize promise failed due to :${e} and referenceId :${reference}`);
              reject(e);
            });
          }).catch((e) => {
            var reference = shortid.generate();
            debug(`collection update failed due to :${e} and referenceId :${reference}`);
            reject(e);
          });
        } else {
          debug("No entity found matching the entityCode " + code);
          reject("No entity found matching the entityCode " + code);
        }
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`collection find failed due to :${e} and referenceId :${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId :${reference}`);
      audit.name = "ENTITY_EXCEPTION_ON_UPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update entity with object ${JSON.stringify(update)}`;
      audit.details = `caught Exception on entity update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy : ${createdBy}, ipAddress : ${ipAddress}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      audit.name = "ENTITY_WORKFLOW_UPDATE INITIALIZED";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update entity with  ${JSON.stringify(update)}`;
      audit.details = `entity update method`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      var filterEntity = {
        "tenantId": tenantId,
        "_id": id
      };
      if (update.processingStatus === "AUTHORIZED") {
        update.activationStatus = "ACTIVE";
      } else {
        update.activationStatus = "INACTIVE";
      }
      debug(`calling db update method, filterEntity: ${JSON.stringify(filterEntity)},update: ${JSON.stringify(update)}`);
      collection.update(filterEntity, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      audit.name = "ENTITY_EXCEPTION_ON_WORKFLOWUPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = `update entity with object ${JSON.stringify(update)}`;
      audit.details = `caught Exception on entity_update ${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      reject(e);
    }
  });
};