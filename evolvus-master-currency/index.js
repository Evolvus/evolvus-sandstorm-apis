const debug = require("debug")("evolvus-masterCurrency:index");
const model = require("./model/masterCurrencySchema");
const dbSchema = require("./db/masterCurrencySchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const masterCurrencyAudit = require("@evolvus/evolvus-docket-client").audit;
const sweClient = require("@evolvus/evolvus-swe-client");
const shortid = require('shortid');

const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("masterCurrency", dbSchema);
var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

masterCurrencyAudit.application = "SANDSTORM_CONSOLE";
masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (masterCurrencyObject) => {
  debug(`index validate method.masterCurrencyObject :${JSON.stringify(masterCurrencyObject)} is aparameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof masterCurrencyObject === "undefined") {
        throw new Error("IllegalArgumentException:menuObject is undefined");
      }
      var res = validate(masterCurrencyObject, schema);
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

module.exports.save = (tenantId, createdBy, ipAddress, masterCurrencyObject) => {
  debug(`index save method,tenantId :${tenantId},createdBy :${createdBy}, ipAddress :${ipAddress },  masterCurrencyObject :${JSON.stringify(masterCurrencyObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof masterCurrencyObject === 'undefined' || masterCurrencyObject == null) {
        throw new Error("IllegalArgumentException: masterCurrencyObject is null or undefined");
      }

      let object = _.merge(masterCurrencyObject, {
        "tenantId": tenantId
      });
      let query = _.merge({
        "tenantId": tenantId,
        "currencyCode": masterCurrencyObject.currencyCode
      });

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${JSON.stringify({})} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {

          if (!_.isEmpty(result[0])) {
            throw new Error(`masterCurrency ${masterCurrencyObject.currencyName}, already exists `);
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
            masterCurrencyAudit.name = "MASTERCURRENCY_SAVE";
            masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
            masterCurrencyAudit.ipAddress = ipAddress;
            masterCurrencyAudit.createdBy = createdBy;
            masterCurrencyAudit.keyDataAsJSON = JSON.stringify(masterCurrencyObject);
            masterCurrencyAudit.details = `masterCurrency creation initiated`;
            masterCurrencyAudit.eventDateTime = Date.now();
            masterCurrencyAudit.status = "SUCCESS";
            docketClient.postToDocket(masterCurrencyAudit);
            debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
            collection.save(object).then((result) => {
              debug(`saved successfully ${result}`);
              var sweEventObject = {
                "tenantId": tenantId,
                "wfEntity": "MASTERCURRENCY",
                "wfEntityAction": "CREATE",
                "createdBy": createdBy,
                "query": result._id

              };
              sweClient.initialize(sweEventObject).then((result) => {           
                
                var filtermasterCurrency = {
                  "tenantId": tenantId,
                  "currencyCode": masterCurrencyObject.currencyCode
                };
                collection.update(filtermasterCurrency, {
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
      masterCurrencyAudit.name = "MASTERCURRENCY_EXCEPTIONONSAVE";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = JSON.stringify(masterCurrencyObject);
      masterCurrencyAudit.details = `caught Exception on masterCurrency_save ${e.message}`;
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "FAILURE";
      docketClient.postToDocket(masterCurrencyAudit);
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
      masterCurrencyAudit.name = "MASTERCURRENCY_FIND";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = "masterCurrency_find";
      masterCurrencyAudit.details = `masterCurrency find initiated`;
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "SUCCESS";
      docketClient.postToDocket(masterCurrencyAudit);
      debug(`calling db find method. query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit}`)
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`masterCurrency(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the masterCurrency(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      masterCurrencyAudit.name = "MASTERCURRENCY_EXCEPTIONONFIND";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = "masterCurrency_find";
      masterCurrencyAudit.details = `caught Exception on masterCurrency_Find${e.message}`;
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "FAILURE";
      docketClient.postToDocket(masterCurrencyAudit);
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
        "currencyCode": code
      };

      debug(`calling DB find method, filter :${JSON.stringify(query)},orderby :${{}} ,skipCount :${0} ,limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`masterCurrency ${update.currencyName},  already exists `);
          }
          if ((!_.isEmpty(result[0])) && (result[0].currencyCode != code)) {
            throw new Error(`masterCurrency ${update.currencyName} already exists`);
          }
          masterCurrencyAudit.name = "MASTERCURRENCY_UPDATE";
          masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
          masterCurrencyAudit.ipAddress = ipAddress;
          masterCurrencyAudit.createdBy = createdBy;
          masterCurrencyAudit.keyDataAsJSON = JSON.stringify(update);
          masterCurrencyAudit.details = `mastercurrency updation initiated`;
          masterCurrencyAudit.eventDateTime = Date.now();
          masterCurrencyAudit.status = "SUCCESS";
          docketClient.postToDocket(masterCurrencyAudit);
          debug(`calling DB update method, filter :${code},update :${JSON.stringify(update)} are parameters`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "MASTERCURRENCY",
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
      masterCurrencyAudit.name = "MASTERCURRENCY_EXCEPTIONONUPDATE";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = JSON.stringify(update);
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "FAILURE";
      masterCurrencyAudit.details = `caught Exception on masterCurrency_Update${e.message}`;
      docketClient.postToDocket(masterCurrencyAudit);
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
      var filtermasterCurrency = {
        "tenantId": tenantId,
        "_id": id
      };
      masterCurrencyAudit.name = "MASTERCURRENCY_UPDATEWORKFLOW";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = JSON.stringify(update);
      masterCurrencyAudit.details = `masterCurrency workflow updation initiated`;
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "SUCCESS";
      docketClient.postToDocket(masterCurrencyAudit);
      debug(`calling db update method, filterRole: ${JSON.stringify(filtermasterCurrency)},update: ${JSON.stringify(update)}`);
      collection.update(filtermasterCurrency, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`update promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      masterCurrencyAudit.name = "MASTERCURRENCY_EXCEPTIONONUPDATEWORKFLOW";
      masterCurrencyAudit.source = "MASTERCURRENCYSERVICE";
      masterCurrencyAudit.ipAddress = ipAddress;
      masterCurrencyAudit.createdBy = createdBy;
      masterCurrencyAudit.keyDataAsJSON = JSON.stringify(update);
      masterCurrencyAudit.eventDateTime = Date.now();
      masterCurrencyAudit.status = "FAILURE";
      masterCurrencyAudit.details = `caught Exception on masterCurrency_UpdateWorkflow${e.message}`;
      docketClient.postToDocket(masterCurrencyAudit);
      var reference = shortid.generate();
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};