const debug = require("debug")("evolvus-application:index");
const model = require("./model/applicationSchema");
const dbSchema = require("./db/applicationSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("application", dbSchema);


var shortid = require('shortid');
var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

var docketObject = {
  // required fields
  application: "PLATFORM",
  source: "application",
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
              reject(res.errors[0].schema.message);
            }
          } else {
            // if the object is valid, save the object to the database
            docketObject.name = "application_save";
            docketObject.keyDataAsJSON = JSON.stringify(applicationObject);
            docketObject.details = `application creation initiated`;
            docketClient.postToDocket(docketObject);
            debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
            collection.save(object).then((result) => {
              debug(`saved successfully ${result}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "APPLICATION",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": result._id
              };
              sweClient.initialize(sweEventObject).then((result) => {
                var filterApplication = {
                  "tenantId": tenantId,
                  "applicationCode": applicationObject.applicationCode
                };
                collection.update(filterApplication, {
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
      docketObject.name = "application_ExceptionOnSave";
      docketObject.keyDataAsJSON = JSON.stringify(applicationObject);
      docketObject.details = `caught Exception on application_save ${e.message}`;
      docketClient.postToDocket(docketObject);
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
      docketObject.name = "application_find";
      docketObject.keyDataAsJSON = "Find all applications";
      docketObject.details = `application creation initiated`;
      docketClient.postToDocket(docketObject);
      debug(`calling db find method. query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit}`)
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
      docketObject.name = "application_ExceptionOnFind";
      docketObject.keyDataAsJSON = "application_Find";
      docketObject.details = `caught Exception on application_Find${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`index find method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};



module.exports.update = (tenantId, ipAddress, createdBy, code, update) => {
  debug(`index update method,tenantId :${tenantId}, code :${code}, update :${JSON.stringify(update)} are parameters`);
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
            throw new Error(`application ${update.applicationName},  already exists `);
          }
          if ((!_.isEmpty(result[0])) && (result[0].applicationCode != code)) {
            throw new Error(`application ${update.applicationName} already exists`);
          }
          docketObject.name = "application_update";
          docketObject.keyDataAsJSON = JSON.stringify(update);
          docketObject.details = `application creation initiated`;
          docketClient.postToDocket(docketObject);
          debug(`calling DB update method, filter :${code},update :${JSON.stringify(update)} are parameters`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "APPLICATION",
              "wfEntityAction": "UPDATE",
              "createdBy": createdBy,
              "query": result[0]._id
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
      docketObject.name = "application_ExceptionOnUpdate";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `caught Exception on application_Update${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`index Update method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};


module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy:${createdBy},ipAddress:${ipAddress}, id :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
      docketObject.name = "application_UpdateWorkFlow";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `application creation initiated`;
      docketClient.postToDocket(docketObject);
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
      docketObject.name = "application_ExceptionOnUpdateWorkFlow";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `caught Exception on application_UpdateWorkFlow ${e.message}`;
      docketClient.postToDocket(docketObject);
      var reference = shortid.generate();
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};