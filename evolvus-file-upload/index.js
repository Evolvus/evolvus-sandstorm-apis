const debug = require("debug")("evolvus-fileUpload:index");
const model = require("./model/fileUploadSchema");
const dbSchema = require("./db/fileUploadSchema");
const _ = require('lodash');
const validate = require("jsonschema").validate;
const docketClient = require("@evolvus/evolvus-docket-client");
const shortid = require('shortid');
const sweClient = require("@evolvus/evolvus-swe-client");
const Dao = require("@evolvus/evolvus-mongo-dao").Dao;
const collection = new Dao("fileUpload", dbSchema);

var schema = model.schema;
var filterAttributes = model.filterAttributes;
var sortAttributes = model.sortAttributes;

var docketObject = {
  // required fields
  fileUpload: "PLATFORM",
  source: "fileUpload",
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

module.exports.validate = (fileUploadObject) => {
  debug(`index validate method,fileUploadObject  :${JSON.stringify(fileUploadObject)} is a parameter`);
  return new Promise((resolve, reject) => {
    try {
      if (typeof fileUploadObject === "undefined") {
        throw new Error("IllegalArgumentException:fileUploadObject is undefined");
      }
      let result = _.merge(fileUploadObject, {
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
module.exports.save = (tenantId, createdBy, ipAddress, fileUploadObject) => {
  debug(`index save method .tenantId :${tenantId}, createdBy:${createdBy}, ipAddress:${ipAddress}, fileUploadObject:${JSON.stringify(fileUploadObject)} ,are parameters)`);
  return new Promise((resolve, reject) => {
    try {
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      if (typeof fileUploadObject === 'undefined' || fileUploadObject == null) {
        throw new Error("IllegalArgumentException: fileUploadObject is null or undefined");
      }

      let object = _.merge(fileUploadObject, {
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
        docketObject.name = "fileUpload_save";
        docketObject.keyDataAsJSON = JSON.stringify(fileUploadObject);
        docketObject.details = `fileUpload creation initiated`;
        docketClient.postToDocket(docketObject);

        debug("calling db save method and parameter is object ", object);
        collection.save(object).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`collection.save promise failed due to ${e} and reference id ${reference}`);
          if (_.isEmpty(result[0])) {
            throw new Error(`fileUpload,  already exists `);
          }
          bug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
    } catch (e) {
      var reference = shortid.generate();
      docketObject.name = "fileUpload_ExceptionOnSave";
      docketObject.keyDataAsJSON = JSON.stringify(fileUploadObject);
      docketObject.details = `caught Exception on fileUpload_save ${e.message}`;
      docketClient.postToDocket(docketObject);
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
      docketObject.name = "fileUpload_find";
      docketObject.keyDataAsJSON = "fileUpload_find";
      docketObject.details = `fileUpload find initiated`;
      docketClient.postToDocket(docketObject);
      debug(`calling db find method.query :${JSON.stringify(query)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} `)
      collection.find(query, orderby, skipCount, limit).then((docs) => {
        debug(`fileUpload(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        var reference = shortid.generate();
        debug(`failed to find all the fileUpload(s) ${e} and reference id : ${reference}`);
        reject(e);
      });
    } catch (e) {
      var reference = shortid.generate();
      docketObject.name = "fileUpload_ExceptionOnFind";
      docketObject.keyDataAsJSON = "fileUpload_find";
      docketObject.details = `caught Exception on fileUpload_Find${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`index find method, try_catch failure due to :${e} ,and referenceId :${reference}`);
      reject(e);
    }
  });
};

module.exports.update = (tenantId, createdBy, ipAddress, code, update) => {
  debug(`index update method,tenantId :${tenantId}, createdBy :${JSON.stringify(createdBy)}, ipAddress :${ipAddress},code :${code}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || code == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/code/update is null or undefined");
      }
      let query = {
        "tenantId": tenantId,
        "fileName": code
      };

      debug(`calling db find method, query :${JSON.stringify(query)},orderby :${{}},skipCount :${0},limit :${1} are parameters`);
      collection.find(query, {}, 0, 1)
        .then((result) => {
          if (_.isEmpty(result[0])) {
            throw new Error(`Unable to Update, fileUpload does not  exists `);
          }
          docketObject.name = "fileUpload_update";
          docketObject.keyDataAsJSON = JSON.stringify(update);
          docketObject.details = `fileUpload update initiated`;
          docketClient.postToDocket(docketObject);
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
      docketObject.name = "fileUpload_ExceptionOnUpdate";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `caught Exception on fileUpload_Update${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`try catch failed due to :${error},and reference id ${reference}`);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.updateWorkflow = (tenantId, createdBy, ipAddress, id, update) => {
  debug(`index updateWorkflow method,tenantId :${tenantId}, createdBy :${JSON.stringify(createdBy)}, ipAddress :${ipAddress},id:${id}, update :${JSON.stringify(update)} are parameters`);
  return new Promise((resolve, reject) => {
    try {
      if (tenantId == null || id == null || update == null) {
        throw new Error("IllegalArgumentException:tenantId/id/update is null or undefined");
      }
      var filterRole = {
        "tenantId": tenantId,
        "_id": id
      };
      docketObject.name = "fileUpload_updateWorkFlow";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `fileUpload updateWorkFlow initiated`;
      docketClient.postToDocket(docketObject);
      debug(`calling db update method, filterRole: ${JSON.stringify(filterRole)},update: ${JSON.stringify(update)}`);
      collection.update(filterRole, update).then((resp) => {
        debug("updatedWorkFlow successfully", resp);
        resolve(resp);
      }).catch((error) => {
        var reference = shortid.generate();
        debug(`updateWorkFlow promise failed due to ${error}, and reference Id :${reference}`);
        reject(error);
      });
    } catch (e) {
      var reference = shortid.generate();
      docketObject.name = "fileUpload_ExceptionOnUpdate";
      docketObject.keyDataAsJSON = JSON.stringify(update);
      docketObject.details = `caught Exception on fileUpload_Update${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`index Update method, try_catch failure due to :${e} and referenceId :${reference}`);
      reject(e);
    }
  });
};