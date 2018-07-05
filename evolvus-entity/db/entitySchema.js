const mongoose = require("mongoose");
const validator = require("validator");

var entitySchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 64
  },
  entityCode: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\-0-9]+$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  entityId: {
    type: String,
    minLength: 5,
    maxLength: 100,
    required: true
  },
  name: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\-0-9]+$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  accessLevel: {
    type: String,
    required: true
  },
  description: {
    type: String,
    minLength: 1,
    maxLength: 255,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\-0-9 ]+$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  enableFlag: {
    type: String,
    enum: ["0", "1"]
  },
  selectedFlag: {
    type: String,
    enum: ["0", "1"]
  },
  processingStatus: {
    type: String,
    default: "PENDING_AUTHORIZATION"
  },
  createdBy: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    required: true
  },
  lastUpdatedDate: {
    type: Date,
    required: true
  },
  parent: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\-0-9]+$/.test(v);
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
  entityCode: 2,
  entityId: 3,
  name: 4
}, {
  unique: true
});

module.exports = entitySchema;
