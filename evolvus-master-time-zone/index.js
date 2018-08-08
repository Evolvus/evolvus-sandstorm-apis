const debug = require("debug")("evolvus-master-time-zone:index");
const model = require("./model/masterTimeZoneSchema");
const dbSchema = require("./db/masterTimeZoneSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const shortid = require('shortid');
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("masterTimeZone", dbSchema);


var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortableAttributes;

var docketObject = {

  masterTimeZone: "PLATFORM",
  source: "masterTimeZone",
  name: "",
  createdBy: "",
  ipAddress: "",
  status: "SUCCESS",
  eventDateTime: Date.now(),
  keyDataAsJSON: "",
  details: "",
  level: ""
};


module.exports = {
  model,
  dbSchema,
  filterAttributes,
  sortAttributes
};


module.exports.validate = (masterTimeZoneObject) => {
  debug(`index validate method.masterTimeZoneObject :${JSON.stringify(masterTimeZoneObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    if (typeof masterTimeZoneObject === "undefined") {
      throw new Error("IllegalArgumentException:masterTimeZoneObject is undefined");
    }
    var res = validate(masterTimeZoneObject, schema);
    debug("validation status: ", JSON.stringify(res));
    if (res.valid) {
      resolve(res.valid);
    } else {
      reject(res.errors);
    }
  });
};

module.exports.save = (tenantId, masterTimeZoneObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof masterTimeZoneObject === 'undefined' || masterTimeZoneObject == null) {
        throw new Error("IllegalArgumentException: masterTimeZoneObject is null or undefined");
      }
      let object = _.merge(masterTimeZoneObject, {
        "tenantId": tenantId
      });
      var res = validate(object, schema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {

        docketObject.name = "masterTimeZone_save";
        docketObject.keyDataAsJSON = JSON.stringify(masterTimeZoneObject);
        docketObject.details = `masterTimeZone creation initiated`;
        docketClient.postToDocket(docketObject);
        collection.save(object).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`save promise failed due to :${e} and referenceId is : ${reference}`);
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId is : ${reference}`);
      docketObject.name = "masterTimeZone_ExceptionOnSave";
      docketObject.keyDataAsJSON = JSON.stringify(masterTimeZoneObject);
      docketObject.details = `caught Exception on masterTimeZone_save ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};



module.exports.find = (tenantId, filter, orderby, skipCount, limit) => {
  debug(`index find method.tenantId :${tenantId}, filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters `);
  return new Promise((resolve, reject) => {
    try {
      let query = _.merge(filter, {
        "tenantId": tenantId
      });
      var invalidFilters = _.difference(_.keys(filter), filterAttributes);
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`masterTimeZone(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`find promise failed due to :${e} and referenceId is : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      debug(`try catch failed due to :${e} and referenceId is : ${reference}`);
      reject(e);
    }
  });
};