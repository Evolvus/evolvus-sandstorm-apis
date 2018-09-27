const mongoose = require("mongoose");
const validator = require("validator");
const contact = require("@evolvus/evolvus-contact");

var Contact = mongoose.model("contact", contact.db);

var entitySchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    minLength: 1,
    maxLength: 64
  },
  wfInstanceId: {
    type: String,
    minlength: 0,
    maxlength: 20
  },
  entityCode: {
    type: String,
    minLength: 6,
    maxLength: 35,
    validate: {
      validator: function(v) {
          return /^[A-Za-z0-9_-]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  entityId: {
    type: String,
    minLength: 6,
    maxLength: 35
  },
  name: {
    type: String,
    minLength: 6,
    maxLength: 35,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9_-]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  accessLevel: {
    type: String
  },
  description: {
    type: String,
    minLength: 6,
    maxLength: 140
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
  selectedFlag: {
    type: String,
    enum: ["true", "false"]

  },
  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },
  createdBy: {
    type: String
  },
  createdDate: {
    type: Date
  },
  lastUpdatedDate: {
    type: Date
  },
  parent: {
    type: String,
    minLength: 6,
    maxLength: 35,
    validate: {
      validator: function(v) {
      return /^[A-Za-z0-9_-]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  contact: {
    type: Object,
    ref: 'Contact'
  }
});
entitySchema.index({
  tenantId: 1,
  entityCode: 1,
  entityId: 1,
  name: 1
}, {
  unique: true
});

module.exports = entitySchema;
