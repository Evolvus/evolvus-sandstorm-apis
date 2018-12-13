const debug = require("debug")("evolvus-application:index");
const model = require("./model/applicationSchema");
const dbSchema = require("./db/applicationSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const applicationAudit = require("@evolvus/evolvus-docket-client").audit;
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("application", dbSchema);

var shortid = require('shortid');
var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

applicationAudit.application = "SANDSTORM_CONSOLE";
applicationAudit.source = "APPLICATIONSERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (applicationObject) => {
  debug(`index validate method.applicationObject :${JSON.stringify(applicationObject)} is aparameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof applicationObject === "undefined") {
        throw new Error("IllegalArgumentException:menuObject is undefined");
      }
      var res = validate(applicationObject, schema);
      debug("validation status: ", JSON.stringify(res));
      if (res.valid) {
        resolve(res.valid);
      } else {
        reject(res.errors);
      }
    } catch (err) {
      var reference = shortid.generate();
      debug("index validate method.exception in try .. catch,reference", reference, err);
      reject(err);
    }
  });
};

module.exports.save = (tenantId, ipAddress, createdBy, applicationObject) => {
  debug(`index save method,tenantId :${tenantId}, ipAddress :${ipAddress }, createdBy :${createdBy}, applicationObject :${JSON.stringify(applicationObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof applicationObject === 'undefined' || applicationObject == null) {
        throw new Error("IllegalArgumentException: applicationObject is null or undefined");
      }
      applicationAudit.name = "APPLICATION_SAVE";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = JSON.stringify(applicationObject);
      applicationAudit.details = `application creation initiated`;
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "SUCCESS";
      docketClient.postToDocket(applicationAudit);
      let object = _.merge(applicationObject, {
        "tenantId": tenantId
      });
      let query = _.merge({
        "tenantId": tenantId,
        "applicationCode": applicationObject.applicationCode
      });
      debug(`calling DB find method, filter :${applicationObject.applicationCode},orderby :${JSON.stringify({})} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (!_.isEmpty(result[0])) {
            throw new Error(`application ${applicationObject.applicationCode}, already exists `);
          }
          var res = validate(object, schema);
          debug("validation status: ", JSON.stringify(res));
          if (!res.valid) {
            if (res.errors[0].name == "required") {
              reject(`${res.errors[0].argument} is required`);
            } else {
              reject(res.errors[0].stack);
            }
          } else {
            // if the object is valid, save the object to the database
            debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
            collection.save(object).then((savedObject) => {
              debug(`saved successfully ${savedObject}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "APPLICATION",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": savedObject._id
              };
              sweClient.initialize(sweEventObject).then((sweResult) => {
                var filterApplication = {
                  "tenantId": tenantId,
                  "applicationCode": savedObject.applicationCode
                };
                collection.update(filterApplication, {
                  "processingStatus": sweResult.data.wfInstanceStatus,
                  "wfInstanceId": sweResult.data.wfInstanceId
                }).then((result) => {
                  resolve(savedObject);
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

    } catch (e) {
      var reference = shortid.generate();
      debug(`index save method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      applicationAudit.name = "APPLICATION_EXCEPTIONONSAVE";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = JSON.stringify(applicationObject);
      applicationAudit.details = `caught Exception on application_save ${e.message}`;
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "FAILURE";
      docketClient.postToDocket(applicationAudit);
      reject(e);
    }
  });
};


module.exports.find = (tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit) => {
  debug(`index find method,tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)},ipAddress :${JSON.stringify(ipAddress)},filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      applicationAudit.name = "APPLICATION_FIND";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = "application_find";
      applicationAudit.details = `application find initiated`;
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "SUCCESS";
      docketClient.postToDocket(applicationAudit);
      debug(`calling db find method. query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit}`);
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`application(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the application(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      applicationAudit.name = "APPLICATION_EXCEPTIONONFIND";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = "application_find";
      applicationAudit.details = `caught Exception on application_Find${e.message}`;
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "FAILURE";
      docketClient.postToDocket(applicationAudit);
      debug(`index find method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};



module.exports.update = (tenantId, ipAddress, createdBy, code, update) => {
  debug(`index update method,tenantId :${tenantId}, ipAddress :${ipAddress}, createdBy :${JSON.stringify(createdBy)}, code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "applicationCode": code
      };

      debug(`calling DB find method, filter :${update.applicationCode},orderby :${{}} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`application ${code} doesn't exists.`);
          }
          if (update.applicationCode != null) {
            throw new Error(`ApplicationCode can't be modified`);
          }
          applicationAudit.name = "APPLICATION_UPDATE";
          applicationAudit.source = "APPLICATIONSERVICE";
          applicationAudit.ipAddress = ipAddress;
          applicationAudit.createdBy = createdBy;
          applicationAudit.keyDataAsJSON = JSON.stringify(update);
          applicationAudit.details = `application updation initiated`;
          applicationAudit.eventDateTime = Date.now();
          applicationAudit.status = "SUCCESS";
          docketClient.postToDocket(applicationAudit);
          debug(`calling DB update method, filter :${code},update :${JSON.stringify(update)} are parameters`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "APPLICATION",
              "wfEntityAction": "UPDATE",
              "createdBy": createdBy,
              "query": result[0]._id,
              "object": result[0]
            };
            sweClient.initialize(sweEventObject).then((result) => {
              collection.update(query, {
                "processingStatus": result.data.wfInstanceStatus,
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
      applicationAudit.name = "APPLICATION_EXCEPTIONONUPDATE";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = JSON.stringify(update);
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "FAILURE";
      applicationAudit.details = `caught Exception on application_Update${e.message}`;
      docketClient.postToDocket(applicationAudit);
      debug(`index Update method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};


module.exports.updateWorkflow = (tenantId, ipAddress, createdBy, id, update) => {
  debug(`index update method,tenantId :${tenantId}, ipAddress :${ipAddress}, createdBy :${createdBy}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
      applicationAudit.name = "APPLICATION_UPDATEWORKFLOW";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = JSON.stringify(update);
      applicationAudit.details = `application workflow updation initiated`;
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "SUCCESS";
      docketClient.postToDocket(applicationAudit);
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
      applicationAudit.name = "APPLICATION_EXCEPTIONONUPDATEWORKFLOW";
      applicationAudit.source = "APPLICATIONSERVICE";
      applicationAudit.ipAddress = ipAddress;
      applicationAudit.createdBy = createdBy;
      applicationAudit.keyDataAsJSON = JSON.stringify(update);
      applicationAudit.eventDateTime = Date.now();
      applicationAudit.status = "FAILURE";
      applicationAudit.details = `caught Exception on application_UpdateWorkflow${e.message}`;
      docketClient.postToDocket(applicationAudit);
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};