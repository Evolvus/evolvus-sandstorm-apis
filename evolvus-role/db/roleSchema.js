const mongoose = require("mongoose");
const validator = require("validator");
const menu = require("@evolvus/evolvus-menu");

// const Menu = mongoose.model("menu", menu.db);
var roleSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    minLength: 1,
    maxLength: 64
  },
  roleType: {
    type: String,
    minLength: 5,
    maxLength: 30
  },
  txnType: {
    type: Array,
    items: {
      type: String
    }
  },
  wfInstanceId: {
    type: String,
    minlength: 0,
    maxlength: 20
  },
  applicationCode: {
    type: String,
    minLength: 3,
    maxLength: 20
  },
  roleName: {
    type: String,
    minLength: 6,
    maxLength: 35,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z-0-9-_ ]+$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  menuGroup: [menu.dbSchema],

  description: {
    type: String,
    minLength: 0,
    maxLength: 140
  },
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  },
  createdDate: {
    type: Date
  },
  selectedFlag: {
    type: Boolean,
    default: false,
    required: false
  },
  lastUpdatedDate: {
    type: Date
  },
  enableFlag: {
    type: String,
    enum: ["true", "false"]
  },
  activationStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE",
    required: true
  },
  processingStatus: {
    type: String,
    default: 'IN_PROGRESS'
  },
  associatedUsers: {
    type: Number,
    required: true
  },
  accessLevel: {
    type: String

  },
  entityId: {
    type: String

  }
});


module.exports = roleSchema;