const debug = require("debug")("evolvus-user:db:user");
const mongoose = require("mongoose");
const ObjectId = require('mongodb')
  .ObjectID;
const _ = require("lodash");

const userSchema = require("./userSchema");
const bcrypt = require('bcryptjs');

// Creates a user collection in the database
var collection = mongoose.model("User", userSchema);
// var EXCLUDE = `'${process.env.EXCLUDE}','userName','saltString'`;

// Saves the user object to the database and returns a Promise
// The assumption here is that the Object is valid
// tenantId must match object.tenantId,if missing it will get added here
module.exports.save = (tenantId, object) => {
  return new Promise((resolve, reject) => {
    let result = _.merge(object, {
      "tenantId": tenantId
    });
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(object.userPassword, salt, function(err, hash) {
        // Assign hashedPassword to your userPassword and salt to saltString ,store it in DB.
        object.userPassword = hash;
        object.saltString = salt;

        let saveObject = new collection(result);
        saveObject.save().then((savedObject) => {
          var object = _.omit(savedObject.toJSON(), 'userPassword', 'token', 'saltString');
          resolve(object);
        }).catch((e) => {
          reject(e);
        });
      });
    });
  });
};


// Returns a limited set of all the user(s) with a Promise
// if the collectiom has no records it Returns
// a promise with a result of  empty object i.e. {}
// limit = 0 returns all the values in the query
// else returns absolute value of limit i.e. -5 or 5 returns 5 rows
// orderby hauserCollections the format { field: 1 } for ascending order and { field: -1 }
// for descending e.g. { "createdDate": 1} or { "applicationCode" : -1 }
// any number other than 1 and -1 throws an error;
// skip can be 0 or more, it cannot be negative
module.exports.find = (tenantId, entityId, accessLevel, filter, orderby, skipCount, limit) => {
  let query = _.merge(filter, {
    "tenantId": tenantId
  });
  query.accessLevel = {
    $gte: accessLevel
  };
  query.entityId = {
    $regex: entityId + ".*"
  };

  return collection.find(query, ['-userPassword', '-saltString', '-token'])
    .sort(orderby)
    .skip(skipCount)
    .limit(limit);
};


// Finds the user which matches the value parameter from user collection
// If there is no object matching the attribute/value, return empty object i.e. {}
// null, undefined should be rejected with Invalid Argument Error
// Should return a Promise
module.exports.findOne = (tenantId, filter) => {
  let query = _.merge(filter, {
    "tenantId": tenantId
  });
  return collection.findOne(query, ['-userPassword', '-saltString', '-token']);
};

// Finds the user for the id parameter from the user collection
// If there is no object matching the id, return empty object i.e. {}
// null, undefined, invalid objects should be rejected with Invalid Argument Error
// All returns are wrapped in a Promise

module.exports.findById = (tenantId, id) => {
  let query = {
    "tenantId": tenantId,
    "_id": new ObjectId(id)
  };
  return collection.findOne(query, ['-userPassword', '-saltString', '-token']);
};


//Finds one user by its code and updates it with new values
// Using the unique key i.e. tenantId/userName
module.exports.update = (tenantId, name, update) => {
  let query = {
    "tenantId": tenantId,
    "userName": name
  };
  console.log("Query", query);
  return collection.update(query, update);
};

// Deletes all the entries of the collection.
// To be used by test only
module.exports.deleteAll = (tenantId) => {
  let query = {
    "tenantId": tenantId
  };
  return collection.remove(query);
};

//Authenticate User credentials {userName,userPassword,application}
module.exports.authenticate = (credentials) => {
  return new Promise((resolve, reject) => {
    try {
      let query = {
        "userName": credentials.userName,
        "enabledFlag": 1,
        "applicationCode": credentials.applicationCode,
        "processingStatus": "AUTHORIZED"
      };
      collection.findOne(query)
        .then((userObj) => {
          if (userObj) {
            bcrypt.hash(credentials.userPassword, userObj.saltString, (err, hash) => {
              // bcrypt.compare(userObj.userPassword,hash, (err, res) => {
              if (hash === userObj.userPassword) {
                userObj = userObj.toObject();
                delete userObj.saltString;
                delete userObj.userPassword;
                debug("authentication successful: ", userObj);
                resolve(userObj);
              } else {
                debug(`Authenttcation failed.Password Error`);
                reject("Authenttcation failed.Password Error");
              }
              // });
            });
          } else {
            debug(`Invalid Credentials.`);
            reject("Invalid Credentials");
          }
        }, (err) => {
          debug(`Invalid Credentials. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on authenticating user: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

module.exports.updateToken = (id, token) => {
  return new Promise((resolve, reject) => {
    try {
      collection.findById({
        _id: new ObjectId(id)
      }).then((user) => {
        if (user) {
          user.set({
            token: token
          });
          user.save().then((res) => {
            res = res.toObject();
            delete res.userPassword;
            delete res.saltString;
            // delete res.token;
            debug(`Token updated successfully ${res}`);
            resolve(res);
          }).catch((e) => {
            debug(`failed to update ${e}`);
            reject(e);
          });
        } else {
          debug(`user not found with id, ${id}`);
          reject(`There is no such user with id:${id}`);
        }
      }).catch((e) => {
        debug(`exception on update ${e}`);
        reject(e.message);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e.message);
    }
  });
};