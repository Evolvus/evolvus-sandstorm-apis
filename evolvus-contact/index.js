const debug = require("debug")("evolvus-contact:index");
const model = require("./model/contactSchema");
const dbSchema = require("./db/contactSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const shortid = require('shortid');
const audit = require("@evolvus/evolvus-docket-client").audit;
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("contact", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

audit.application = "SANDSTORM_CONSOLE";
audit.source = "CONTACTS";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};


module.exports.validate = (contactObject) => {
  debug(`index validate method.contactObject :${JSON.stringify(contactObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof contactObject === "undefined") {
        throw new Error("IllegalArgumentException:contactObject is undefined");
      }
      var res = validate(contactObject, schema);
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

module.exports.save = (tenantId, createdBy, ipAddress, contactObject) => {
  debug(`index save method,tenantId :${tenantId}, createdBy :${createdBy}, ipAddress :${ipAddress }, contactObject :${JSON.stringify(contactObject)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof contactObject === 'undefined' || contactObject == null) {
        throw new Error("IllegalArgumentException: contactObject is null or undefined");
      }

      let object = _.merge(contactObject, {
        "tenantId": tenantId
      });

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
        audit.name = "CONTACT_SAVE";
        audit.ipAddress = ipAddress;
        audit.createdBy = createdBy;
        audit.keyDataAsJSON = JSON.stringify(contactObject);
        audit.details = `contact creation initiated`;
        audit.eventDateTime = Date.now();
        audit.status = "SUCCESS";
        docketClient.postToDocket(audit);
        debug(`calling db save method object :${JSON.stringify(object)} is a parameter`);
        collection.save(object).then((result) => {
          debug(`saved successfully ${result}`);
          var sweEventObject = {
            "tenantId": tenantId,
            "wfEntity": "CONTACT",
            "wfEntityAction": "CREATE",
            "createdBy": createdBy,
            "query": result._id

          };
          sweClient.initialize(sweEventObject).then((result) => {
            var filtercontact = {
              "tenantId": tenantId,
              "emailId": contactObject.emailId
            };
            collection.update(filtercontact, {
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

      // Other validations here
    } catch (e) {
      var reference = shortid.generate();
      debug(`index save method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      audit.name = "CONTACT_EXCEPTIONONSAVE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(contactObject);
      audit.details = `caught Exception on contact_save ${e.message}`;
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
module.exports.find = (tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit) => {
  debug(`index find method,tenantId :${tenantId},createdBy :${createdBy},ipAddress :${JSON.stringify(ipAddress)}, filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)} , skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      audit.name = "CONTACT_FIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "contact_find";
      audit.details = `contact find initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
      debug(`calling db find method .query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`contact(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`findAll promise failed due to : ${e}, and referenceid is ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      audit.name = "CONTACT_EXCEPTIONONFIND";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = "contact_find";
      audit.details = `caught Exception on contact_Find${e.message}`;
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      docketClient.postToDocket(audit);
      debug(`try catch failed due to : ${e}, and referenceid is ${reference}`);
      reject(e);
    }
  });
};


module.exports.update = (tenantId, createdBy, ipAddress, code, update) => {
  debug(`index update method,tenantId :${tenantId},createdBy :${createdBy},ipAddress :${ipAddress}, code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "emailId": code
      };
      debug(`calling db find method, query :${JSON.stringify(query)},orderby :${{}},skipCount :${0},limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`Unable to Update contact already exists `);
          }
          audit.name = "CONTACT_UPDATE";
          audit.ipAddress = ipAddress;
          audit.createdBy = createdBy;
          audit.keyDataAsJSON = JSON.stringify(update);
          audit.details = `contact updation initiated`;
          audit.eventDateTime = Date.now();
          audit.status = "SUCCESS";
          docketClient.postToDocket(audit);
          debug(`calling db update method,code :${code},update :${JSON.stringify(update)} parameter`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
            var sweEventObject = {
              "tenantId": tenantId,
              "wfEntity": "CONTACT",
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
            debug(`update promise failed due to :${error},and reference id ${reference}`);
            debug(`failed to update ${error}`);
            reject(error);
          });
        }).catch((error) => {
          var reference = shortid.generate();
          debug(`find promise failed due to ${error} and referenceId :${reference}`);
          reject(error);
        });
    } catch (e) {
      var reference = shortid.generate();
      audit.name = "CONTACT_EXCEPTIONONUPDATE";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(update);
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      audit.details = `caught Exception on contact_Update${e.message}`;
      docketClient.postToDocket(audit);
      debug(`try catch failed due to :${e},and reference id ${reference}`);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index updateWorkFlow method,tenantId :${tenantId},createdBy :${createdBy},ipAddress :${ipAddress}, code :${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
      audit.name = "CONTACT_UPDATEWORKFLOW";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(update);
      audit.details = `contact workflow updation initiated`;
      audit.eventDateTime = Date.now();
      audit.status = "SUCCESS";
      docketClient.postToDocket(audit);
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
      audit.name = "CONTACT_EXCEPTIONONUPDATEWORKFLOW";
      audit.ipAddress = ipAddress;
      audit.createdBy = createdBy;
      audit.keyDataAsJSON = JSON.stringify(update);
      audit.eventDateTime = Date.now();
      audit.status = "FAILURE";
      audit.details = `caught Exception on contact_UpdateWorkflow${e.message}`;
      docketClient.postToDocket(audit);
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};