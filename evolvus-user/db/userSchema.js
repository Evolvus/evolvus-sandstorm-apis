const mongoose = require('mongoose');
const validator = require('validator');

const role = require('@evolvus/evolvus-role');
const contact = require("@evolvus/evolvus-contact");

var userSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: true,
    min: 1,
    max: 64
  },
  tenantName: {
    type: String,
    min: 1,
    max: 64
  },
  uniquereferenceid: {
    type: String
  },
  wfInstanceId: {
    type: String,
    maxlength: 20
  },
  userId: {
    type: String,
    unique: true,
    required: true,
    min: 6,
    max: 35,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9_-]*$/.test(v);
      },
      message: "{PATH} can contain only alphanumeric and _ -"
    }
  },
  applicationCode: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  contact: contact.dbSchema,
  entityId: {
    type: String,
    minLength: 5,
    maxLength: 100,
    required: true
  },
  role: role.dbSchema,
  userName: {
    type: String,
    min: 6,
    max: 140,
    required: true
  },
  userPassword: {
    type: String,
    required: true
  },
  saltString: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  },
  createdDate: {
    type: Date,
    required: true
  },
  lastUpdatedDate: {
    type: Date
  },
  enabledFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true"
  },
  deletedFlag: {
    type: String,
    enum: ["true", "false"],
    default: "false"
  },
  accessLevel: {
    type: String,
    required: true
  },
  selectedFlag: {
    type: Boolean,
    default: false
  },
  activationStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE"
  },
  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },
  token: {
    type: String
  },
  supportedDateFormats: {
    type: String
  },
  masterCurrency: {
    type: String
  },
  masterTimeZone: {
    type: String
  },
  designation: {
    type: String,
    max: 35,
    validate: {
      validator: function(v) {
        return /^[ A-Za-z0-9_@.,;:/&!^*(){}[\]?$%#&=+-]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers and specialcharacters"
    }
  },
  dailyLimit: {
    type: Number,
    maxLength: 16,
    validate: {
      validator: function(v) {
        return /^[0-9.]*$/.test(v);
      },
      message: "{PATH} can contain only numbers and ."
    }
  },
  individualTransactionLimit: {
    type: Number,
    maxLength: 16,
    validate: {
      validator: function(v) {
        return /^[0-9.]*$/.test(v);
      },
      message: "{PATH} can contain only numbers and . "
    }
  },
  loginStatus: {
    type: String,
    enum: ["LOGGED_IN", "LOGGED_OUT"],
    default: "LOGGED_OUT"
  },
  firstLogin:{
    type:String,
    enum:["true","false"],
    default:"true"
  }
});

userSchema.index({
  tenantId: 1,
  userId: 1
}, {
  unique: true
});

module.exports = userSchema;