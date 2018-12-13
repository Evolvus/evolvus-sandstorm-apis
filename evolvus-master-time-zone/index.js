const debug = require("debug")("evolvus-master-time-zone:index");
const model = require("./model/masterTimeZoneSchema");
const dbSchema = require("./db/masterTimeZoneSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const masterTimeZoneAudit = require("@evolvus/evolvus-docket-client").audit;
const sweClient = require("@evolvus/evolvus-swe-client");
const shortid = require('shortid');
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("masterTimeZone", dbSchema);


var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

masterTimeZoneAudit.application = "SANDSTORM_CONSOLE";
masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};


module.exports.validate = (masterTimeZoneObject) => {
  debug(`index validate method.masterTimeZoneObject :${JSON.stringify(masterTimeZoneObject)} is aparameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof masterTimeZoneObject === "undefined") {
        throw new Error("IllegalArgumentException:menuObject is undefined");
      }
      var res = validate(masterTimeZoneObject, schema);
      debug("validation status: ", JSON.stringify(res));
      if (res.valid) {
        resolve(res.valid);
      } else {
        reject(res.errors);
      }
    } catch (err) {
      var reference = shortid.generate();
      debug(`index validate method failure due to :${err} and referenceId :${reference}`);
      reject(err);
    }
  });
};

module.exports.save = (tenantId, createdBy, ipAddress, masterTimeZoneObject) => {
  debug(`index save method,tenantId :${tenantId},createdBy :${createdBy}, ipAddress :${ipAddress },  masterTimeZoneObject :${JSON.stringify(masterTimeZoneObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof masterTimeZoneObject === 'undefined' || masterTimeZoneObject == null) {
        throw new Error("IllegalArgumentException: masterTimeZoneObject is null or undefined");
      }

      let object = _.merge(masterTimeZoneObject, {
        "tenantId": tenantId
      });
      let query = _.merge({
        "tenantId": tenantId,
        "zoneCode": masterTimeZoneObject.zoneCode
      });

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${JSON.stringify({})} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {

          if (!_.isEmpty(result[0])) {
            throw new Error(`masterTimeZone ${masterTimeZoneObject.zoneName}, already exists `);
          }

          var res = validate(object, schema);
          debug("validation status: ", JSON.stringify(res));
          if (!res.valid) {
            if (res.errors[0].name == "required") {
              reject(`${res.errors[0].argument} is required`);
            } else {
              reject(res.errors[0].schema.message);
            }
          } else {
            // if the object is valid, save the object to the database
            masterTimeZoneAudit.name = "MASTERTIMEZONE_SAVE";
            masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
            masterTimeZoneAudit.ipAddress = ipAddress;
            masterTimeZoneAudit.createdBy = createdBy;
            masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(masterTimeZoneObject);
            masterTimeZoneAudit.details = `masterTimeZone creation initiated`;
            masterTimeZoneAudit.eventDateTime = Date.now();
            masterTimeZoneAudit.status = "SUCCESS";
            docketClient.postToDocket(masterTimeZoneAudit);
            debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
            collection.save(object).then((result) => {
              debug(`saved successfully ${result}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "MASTERTIMEZONE",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": result._id

              };
              sweClient.initialize(sweEventObject).then((result) => {
                var filtermasterTimeZone = {
                  "tenantId": tenantId,
                  "zoneCode": masterTimeZoneObject.zoneCode
                };
                collection.update(filtermasterTimeZone, {
                  "processingStatus": result.data.wfEvent,
                  "wfInstanceId": result.data.wfInstanceId
                }).then((result) => {
                  resolve(result);
                }).catch((e) => {
                  var reference = shortid.generate();
                  debug(`Update promise  failed due to :${e} and referenceId :${reference}`);
                  reject(e);
                });
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`initialize promise failed due to :${e} and referenceId :${reference}`);
                reject(e);
              });
            }).catch((e) => {
              var reference = shortid.generate();
              debug(`failed to save with an error: ${e},and reference: ${reference}`);
              reject(e);
            });
          }
        }).catch((error) => {
          var reference = shortid.generate();
          debug(`find promise failed due to ${error} and referenceId :${reference}`);
          reject(error);
        });
      // Other validations here
    } catch (e) {
      var reference = shortid.generate();
      debug(`index save method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      masterTimeZoneAudit.name = "MASTERTIMEZONE_EXCEPTIONONSAVE";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(masterTimeZoneObject);
      masterTimeZoneAudit.details = `caught Exception on masterTimeZone_save ${e.message}`;
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "FAILURE";
      docketClient.postToDocket(masterTimeZoneAudit);
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
  debug(`index find method,tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)},ipAddress :${JSON.stringify(ipAddress)},filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      masterTimeZoneAudit.name = "MASTERTIMEZONE_FIND";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = "masterTimeZone_find";
      masterTimeZoneAudit.details = `masterTimeZone find initiated`;
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "SUCCESS";
      docketClient.postToDocket(masterTimeZoneAudit);
      debug(`calling db find method. query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit}`)
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`masterTimeZone(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the masterTimeZone(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      masterTimeZoneAudit.name = "MASTERTIMEZONE_EXCEPTIONONFIND";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = "masterTimeZone_find";
      masterTimeZoneAudit.details = `caught Exception on masterTimeZone_Find${e.message}`;
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "FAILURE";
      docketClient.postToDocket(masterTimeZoneAudit);
      debug(`index find method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};



module.exports.update = (tenantId, createdBy, ipAddress, code, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)}, ipAddress :${ipAddress},  code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "zoneCode": code
      };

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${{}} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`masterTimeZone ${update.zoneName},  already exists `);
          }
          if ((!_.isEmpty(result[0])) && (result[0].zoneCode != code)) {
            throw new Error(`masterTimeZone ${update.zoneName} already exists`);
          }
          masterTimeZoneAudit.name = "MASTERTIMEZONE_UPDATE";
          masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
          masterTimeZoneAudit.ipAddress = ipAddress;
          masterTimeZoneAudit.createdBy = createdBy;
          masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(update);
          masterTimeZoneAudit.details = `masterTimeZone updation initiated`;
          masterTimeZoneAudit.eventDateTime = Date.now();
          masterTimeZoneAudit.status = "SUCCESS";
          docketClient.postToDocket(masterTimeZoneAudit);
          debug(`calling DB update method, filter :${query},update :${JSON.stringify(update)} are parameters`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "MASTERTIMEZONE",
              "wfEntityAction": "UPDATE",
              "createdBy": createdBy,
              "query": result[0]._id,
              "object": result[0]
            };
            sweClient.initialize(sweEventObject).then((result) => {
              collection.update(query, {
                "processingStatus": result.data.wfEvent,
                "wfInstanceId": result.data.wfInstanceId
              }).then((result) => {
                resolve(result);
              }).catch((e) => {
                var reference = shortid.generate();
                debug(`Update promise  failed due to :${e} and referenceId :${reference}`);
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
          debug(`find promise failed due to ${error} and referenceId :${reference}`);
          reject(error);
        });
    } catch (e) {
      var reference = shortid.generate();
      masterTimeZoneAudit.name = "MASTERTIMEZONE_EXCEPTIONONUPDATE";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(update);
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "FAILURE";
      masterTimeZoneAudit.details = `caught Exception on masterTimeZone_Update${e.message}`;
      docketClient.postToDocket(masterTimeZoneAudit);
      debug(`index Update method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};


module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index update method,tenantId :${tenantId}, createdBy :${createdBy}, ipAddress :${ipAddress}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filtermasterTimeZone = {
        "tenantId": tenantId,
        "_id": id
      };
      masterTimeZoneAudit.name = "MASTERTIMEZONE_UPDATEWORKFLOW";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(update);
      masterTimeZoneAudit.details = `masterTimeZone workflow updation initiated`;
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "SUCCESS";
      docketClient.postToDocket(masterTimeZoneAudit);
      debug(`calling db update method, filterRole: ${JSON.stringify(filtermasterTimeZone)},update: ${JSON.stringify(update)}`);
      collection.update(filtermasterTimeZone, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      masterTimeZoneAudit.name = "MASTERTIMEZONE_EXCEPTIONONUPDATEWORKFLOW";
      masterTimeZoneAudit.source = "MASTERTIMEZONESERVICE";
      masterTimeZoneAudit.ipAddress = ipAddress;
      masterTimeZoneAudit.createdBy = createdBy;
      masterTimeZoneAudit.keyDataAsJSON = JSON.stringify(update);
      masterTimeZoneAudit.eventDateTime = Date.now();
      masterTimeZoneAudit.status = "FAILURE";
      masterTimeZoneAudit.details = `caught Exception on masterTimeZone_UpdateWorkflow${e.message}`;
      docketClient.postToDocket(masterTimeZoneAudit);
      var reference = shortid.generate();
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};