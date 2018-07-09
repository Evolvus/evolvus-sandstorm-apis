const debug = require("debug")("evolvus-role:index");
const model = require("./model/roleSchema");
const _ = require('lodash');
const db = require("./db/roleSchema");
const collection = require("./db/role");
const validate = require("jsonschema").validate;
const docketClient = require("evolvus-docket-client");

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

var auditObject = {
  // required fields
  role: "PLATFORM",
  source: "role",
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
  sortableAttributes
};
module.exports.validate = (tenantId, roleObject) => {
  return new Promise((resolve, reject) => {
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
  });
};

// tenantId cannot be null or undefined, InvalidArgumentError
// check if tenantId is valid from tenant table (todo)
//
// createdBy can be "System" - it cannot be validated against users
// ipAddress is needed for docket, must be passed
//
// object has all the attributes except tenantId, who columns
module.exports.save = (tenantId, roleObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof roleObject === 'undefined' || roleObject == null) {
        throw new Error("IllegalArgumentException: roleObject is null or undefined");
      }
      var res = validate(roleObject, schema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // if the object is valid, save the object to the database
        collection.save(tenantId, roleObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
      // Other validations here
    } catch (e) {
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
        console.log("DOCS", docs);
        debug(`role(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        debug(`failed to find all the role(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      console.log(e, "error");
      reject(e);
    }
  });
};

module.exports.update = (tenantId, code, update) => {
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      collection.update(tenantId, code, update).then((resp) => {
        console.log("response for update", resp);
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

module.exports.counts = (tenantId, countQuery) => {
  return new Promise((resolve, reject) => {
    try {
      collection.counts(tenantId, entityId, accessLevel, countQuery).then((roleCount) => {
        console.log("roleCount", roleCount);
        if (roleCount > 0) {
          debug(`roleCount Data is ${roleCount}`);
          resolve(roleCount);
        } else {
          debug(`No role count data available for filter query ${roleCount}`);
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