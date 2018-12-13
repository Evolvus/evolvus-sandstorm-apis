const debug = require("debug")("evolvus-supported-date-formats:index");
const model = require("./model/supportedDateFormatsSchema");
const dbSchema = require("./db/supportedDateFormatsSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const dateFormatsAudit = require("@evolvus/evolvus-docket-client").audit;
const sweClient = require("@evolvus/evolvus-swe-client");
const shortid = require('shortid');
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("supportedDateFormats", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

dateFormatsAudit.application = "SANDSTORM_CONSOLE";
dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (supportedDateFormatsObject) => {
  debug(`index validate method.supportedDateFormatsObject :${JSON.stringify(supportedDateFormatsObject)} is aparameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof supportedDateFormatsObject === "undefined") {
        throw new Error("IllegalArgumentException:menuObject is undefined");
      }
      var res = validate(supportedDateFormatsObject, schema);
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

module.exports.save = (tenantId, createdBy, ipAddress, supportedDateFormatsObject) => {
  debug(`index save method,tenantId :${tenantId},createdBy :${createdBy}, ipAddress :${ipAddress },  supportedDateFormatsObject :${JSON.stringify(supportedDateFormatsObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof supportedDateFormatsObject === 'undefined' || supportedDateFormatsObject == null) {
        throw new Error("IllegalArgumentException: supportedDateFormatsObject is null or undefined");
      }

      let object = _.merge(supportedDateFormatsObject, {
        "tenantId": tenantId
      });
      let query = _.merge({
        "tenantId": tenantId,
        "formatCode": supportedDateFormatsObject.formatCode
      });

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${JSON.stringify({})} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {

          if (!_.isEmpty(result[0])) {
            throw new Error(`supportedDateFormats ${supportedDateFormatsObject.formatCode}, already exists `);
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
            dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_SAVE";
            dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
            dateFormatsAudit.ipAddress = ipAddress;
            dateFormatsAudit.createdBy = createdBy;
            dateFormatsAudit.keyDataAsJSON = JSON.stringify(supportedDateFormatsObject);
            dateFormatsAudit.details = `supportedDateFormats creation initiated`;
            dateFormatsAudit.eventDateTime = Date.now();
            dateFormatsAudit.status = "SUCCESS";
            docketClient.postToDocket(dateFormatsAudit);
            debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
            collection.save(object).then((result) => {
              debug(`saved successfully ${result}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "SUPPORTEDDATEFORMATS",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": result._id

              };
              sweClient.initialize(sweEventObject).then((result) => {
                var filtersupportedDateFormats = {
                  "tenantId": tenantId,
                  "formatCode": supportedDateFormatsObject.formatCode
                };
                collection.update(filtersupportedDateFormats, {
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
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_EXCEPTIONONSAVE";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = JSON.stringify(supportedDateFormatsObject);
      dateFormatsAudit.details = `caught Exception on supportedDateFormats_save ${e.message}`;
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "FAILURE";
      docketClient.postToDocket(dateFormatsAudit);
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
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_FIND";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = "supportedDateFormats_find";
      dateFormatsAudit.details = `supportedDateFormats find initiated`;
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "SUCCESS";
      docketClient.postToDocket(dateFormatsAudit);
      debug(`calling db find method. query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit}`)
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`supportedDateFormats(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the supportedDateFormats(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_EXCEPTIONONFIND";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = "supportedDateFormats_find";
      dateFormatsAudit.details = `caught Exception on supportedDateFormats_Find${e.message}`;
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "FAILURE";
      docketClient.postToDocket(dateFormatsAudit);
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
        "formatCode": code
      };

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${{}} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`supportedDateFormats ${update.formatCode},  already exists `);
          }
          if ((!_.isEmpty(result[0])) && (result[0].formatCode != code)) {
            throw new Error(`supportedDateFormats ${update.formatCode} already exists`);
          }
          dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_UPDATE";
          dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
          dateFormatsAudit.ipAddress = ipAddress;
          dateFormatsAudit.createdBy = createdBy;
          dateFormatsAudit.keyDataAsJSON = JSON.stringify(update);
          dateFormatsAudit.details = `supportedDateFormats  updation initiated`;
          dateFormatsAudit.eventDateTime = Date.now();
          dateFormatsAudit.status = "SUCCESS";
          docketClient.postToDocket(dateFormatsAudit);
          debug(`calling DB update method, filter :${query},update :${JSON.stringify(update)} are parameters`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "SUPPORTEDDATEFORMATS",
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
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_EXCEPTIONONUPDATE";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = JSON.stringify(update);
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "FAILURE";
      dateFormatsAudit.details = `caught Exception on supportedDateFormats_Update${e.message}`;
      docketClient.postToDocket(dateFormatsAudit);
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
      var filtersupportedDateFormats = {
        "tenantId": tenantId,
        "_id": id
      };
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_UPDATEWORKFLOW";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = JSON.stringify(update);
      dateFormatsAudit.details = `supportedDateFormats workflow updation initiated`;
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "SUCCESS";
      docketClient.postToDocket(dateFormatsAudit);
      debug(`calling db update method, filtersupportedDateFormats: ${JSON.stringify(filtersupportedDateFormats)},update: ${JSON.stringify(update)}`);
      collection.update(filtersupportedDateFormats, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      dateFormatsAudit.name = "SUPPORTEDDATEFORMATS_EXCEPTIONONUPDATEWORKFLOW";
      dateFormatsAudit.source = "SUPPORTEDDATEFORMATS_SERVICE";
      dateFormatsAudit.ipAddress = ipAddress;
      dateFormatsAudit.createdBy = createdBy;
      dateFormatsAudit.keyDataAsJSON = JSON.stringify(update);
      dateFormatsAudit.eventDateTime = Date.now();
      dateFormatsAudit.status = "FAILURE";
      dateFormatsAudit.details = `caught Exception on supportedDateFormats_UpdateWorkflow${e.message}`;
      docketClient.postToDocket(dateFormatsAudit);
      var reference = shortid.generate();
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};