const debug = require("debug")("evolvus-menu:index");
const model = require("./model/menuSchema");
const dbSchema = require("./db/menuSchema");
const _ = require("lodash");
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const menuAudit = require("@evolvus/evolvus-docket-client").audit;
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("menu", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

menuAudit.application = "SANDSTORM_CONSOLE";
menuAudit.source = "MENUSERVICE";

module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};

module.exports.validate = (menuObject) => {
  return new Promise((resolve, reject) => {
    if (typeof menuObject === "undefined") {
      throw new Error("IllegalArgumentException:menuObject is undefined");
    }
    var res = validate(menuObject, schema);
    debug("validation status: ", JSON.stringify(res));
    if (res.valid) {
      resolve(res.valid);
    } else {
      reject(res.errors);
    }
  });
};

module.exports.save = (tenantId, menuObject,ipAddress,createdBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof menuObject === 'undefined' || menuObject == null) {
        throw new Error("IllegalArgumentException: menuObject is null or undefined");
      }
      menuAudit.name = "MENU_SAVE";
      menuAudit.source = "MENUSERVICE";
      menuAudit.ipAddress = ipAddress;
      menuAudit.createdBy = createdBy;
      menuAudit.keyDataAsJSON = JSON.stringify(menuObject);
      menuAudit.details = `Menu creation initiated`;
      menuAudit.eventDateTime = Date.now();
      menuAudit.status = "SUCCESS";
      docketClient.postToDocket(menuAudit);
      let object = _.merge(menuObject, {
        "tenantId": tenantId
      });
      var res = validate(object, schema);

      debug("Validation status: ", JSON.stringify(res));
      if (!res.valid) {
        if (res.errors[0].name === 'required') {
          reject(`${res.errors[0].argument} is Required`);
        } else {
          reject(res.errors[0].stack);
        }
      } else {
        collection.save(object).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
      // Other validations here
    } catch (e) {
      menuAudit.name = "MENU_EXCEPTIONONSAVE";
      menuAudit.source = "MENUSERVICE";
      menuAudit.ipAddress = ipAddress;
      menuAudit.createdBy = createdBy;
      menuAudit.keyDataAsJSON = JSON.stringify(menuObject);
      menuAudit.details = `Menu creation Failed`;
      menuAudit.eventDateTime = Date.now();
      menuAudit.status = "FAILURE";
      docketClient.postToDocket(menuAudit);
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
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null) {
        throw new Error("IllegalArgumentException: tenantId is null or undefined");
      }
      menuAudit.name = "MENU_FIND";
      menuAudit.source = "MENUSERVICE";
      menuAudit.ipAddress = ipAddress;
      menuAudit.createdBy = createdBy;
      menuAudit.keyDataAsJSON = JSON.stringify(filter);
      menuAudit.details = `Menu find initiated`;
      menuAudit.eventDateTime = Date.now();
      menuAudit.status = "SUCCESS";
      docketClient.postToDocket(menuAudit);

      collection.find(filter, orderby, skipCount, limit).then((docs) => {
        debug(`menu(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        debug(`failed to find all the menu(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      menuAudit.name = "MENU_EXCEPTIONONFIND";
      menuAudit.source = "MENUSERVICE";
      menuAudit.ipAddress = ipAddress;
      menuAudit.createdBy = createdBy;
      menuAudit.keyDataAsJSON = JSON.stringify(filter);
      menuAudit.details = `Menu find Failed`;
      menuAudit.eventDateTime = Date.now();
      menuAudit.status = "FAILURE";
      docketClient.postToDocket(menuAudit);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};