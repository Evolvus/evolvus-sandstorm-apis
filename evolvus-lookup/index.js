const debug = require("debug")("evolvus-lookup:index");
const model = require("./model/lookupSchema");
const dbSchema = require("./db/lookupSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const shortid = require('shortid');
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("lookup", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortAttributes;

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
  dbSchema,
  model,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (lookupObject) => {
  debug(`index validate method,lookupObject  :${JSON.stringify(lookupObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof lookupObject === "undefined") {
        throw new Error("IllegalArgumentException:lookupObject is undefined");
      }
      let result = _.merge(lookupObject, {
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
module.exports.save = (tenantId, createdBy, ipAddress, lookupObject) => {
  debug(`index save method .tenantId :${tenantId}, createdBy:${createdBy}, ipAddress:${ipAddress}, lookupObject:${JSON.stringify(lookupObject)} ,are parameters)`);
  return new Promise((resolve, reject) => {
    try {
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      if (typeof lookupObject === 'undefined' || lookupObject == null) {
        throw new Error("IllegalArgumentException: lookupObject is null or undefined");
      }

      let object = _.merge(lookupObject, {
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
        docketObject.name = "lookup_save";
        docketObject.keyDataAsJSON = JSON.stringify(lookupObject);
        docketObject.details = `lookup creation initiated`;
        docketClient.postToDocket(docketObject);

        debug("calling db save method and parameter is object ", object);
        collection.save(object).then((result) => {
          debug(`saved successfully ${result}`);
          var sweEventObject = {
            "tenantId": tenantId,
            "wfEntity": "LOOKUP",
            "wfEntityAction": "CREATE",
            "createdBy": createdBy,
            "query": result.lookupCode
          };
          sweClient.initialize(sweEventObject).then((result) => {
            console.log(result, "result");
            var filterLookup = {
              "lookupCode": lookupObject.lookupCode
            };
            collection.update(filterLookup, {
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
          debug(`collection.save promise failed due to ${e} and reference id ${reference}`);
          if (_.isEmpty(result[0])) {
            throw new Error(`lookup ${body.lookupCode},  already exists `);
          }
          bug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }

    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to ${e} and reference id ${reference}`);
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
  debug(`index find method,tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)},ipAddress :${JSON.stringify(ipAddress)},filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`lookup(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the lookup(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`index find method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};

module.exports.update = (tenantId, ipAddress, createdBy, code, update) => {
  debug(`index update method,tenantId :${tenantId}, ipAddress :${ipAddress}, createdBy :${JSON.stringify(createdBy)},code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }

      let query = {
        "tenantId": tenantId,
        "lookupCode": code
      };
      debug(`calling db find method, query :${JSON.stringify(query)},orderby :${orderby},skipCount :${skipCount},limit :${limit} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`Unable to Update lookup already exists `);
          }
          debug(`calling db update method,code :${code},update :${update} parameter`);
          collection.update(query, update).then((resp) => {
            debug("updated successfully", resp);
            resolve(resp);
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
      debug(`try catch failed due to :${error},and reference id ${reference}`);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, ipAddress, createdBy, id, update) => {
  debug(`index updateWorkflow method,tenantId :${tenantId}, ipAddress :${ipAddress}, createdBy :${JSON.stringify(createdBy)},code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/id/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
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
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};