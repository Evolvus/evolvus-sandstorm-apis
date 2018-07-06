const debug = require("debug")("evolvus-contact:index");
const model = require("./model/entitySchema");
const db = require("./db/entitySchema");
const _ = require('lodash');
const collection = require("./db/entity");
const validate = require("jsonschema").validate;
const docketClient = require("evolvus-docket-client");

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

var docketObject = {
  // required fields
  contact: "PLATFORM",
  source: "contact",
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
  db,
  filterAttributes,
  sortAttributes
};
module.exports.validate = (tenantId, entityObject) => {
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
module.exports.save = (tenantId, entityObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof entityObject === 'undefined' || entityObject == null) {
        throw new Error("IllegalArgumentException: entityObject is null or undefined");
      }
      var res = validate(tenantId, entityObject, schema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // if the object is valid, save the object to the database
        docketObject.name = "entity_save";
        docketObject.keyDataAsJSON = JSON.stringify(entityObject);
        docketObject.details = `entity creation initiated`;
        docketClient.postToDocket(docketObject);
        collection.save(tenantId, entityObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          console.log(e, "save");
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
      // Other validations here
    } catch (e) {
      console.log(e, "save");
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
module.exports.find = (tenantId, entityId, accessLevel, filter, orderby, skipCount, limit) => {
  return new Promise((resolve, reject) => {
    try {
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      collection.find(tenantId, entityId, accessLevel, filter, orderby, skipCount, limit).then((docs) => {
        debug(`menu(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        console.log(e);
        debug(`failed to find all the menu(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
};

// tenantId should be valid
module.exports.update = (tenantId, code, update) => {
  return new Promise((resolve, reject) => {
    try {
      if (code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      collection.update(tenantId, code, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        debug(`failed to update ${error}`);
        reject(error);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.counts = (tenantId, entityId, accessLevel, countQuery) => {
  return new Promise((resolve, reject) => {
    try {
      collection.counts(tenantId, entityId, accessLevel, countQuery).then((entityCount) => {
        if (entityCount > 0) {
          debug(`entityCount Data is ${entityCount}`);
          resolve(entityCount);
        } else {
          debug(`No entity count data available for filter query ${entityCount}`);
          resolve(0);
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};