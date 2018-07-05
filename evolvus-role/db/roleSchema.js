const mongoose = require("mongoose");
const validator = require("validator");
const {
  menu
} = require("evolvus-menu");

var Menu = mongoose.model("menu", menu.db);

var roleSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 64
  },
  applicationCode: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20
  },
  roleName: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 35,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z-0-9-_ ]+$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers"
    }
  },
  menuGroup: {
    type: Array,
    minItems: 1,
    items: {
      ref: 'Menu'
    },
    required: true
  },
  description: {
    type: String,
    minLength: 6,
    maxLength: 140,
    required: true,
    validate: {
      validator: function(v) {
        return /^[ A-Za-z0-9_@.,;:/&!^*(){}[\]?$%#&=+-]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and numbers and specialcharacters"
    }
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
  selectedFlag: {
    type: String,
    enum: ["0", "1"]
  },
  lastUpdatedDate: {
    type: Date,
    required: true
  },
  enableFlag: {
    type: String,
    enum: ["0", "1"]
  },
  activationStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    required: true
  },
  processingStatus: {
    type: String,
    enum: ['PENDING_AUTHORIZATION', 'AUTHORIZED', 'REJECTED'],
    default: 'PENDING_AUTHORIZATION'
  },
  associatedUsers: {
    type: Number,
    required: true
  },
  accessLevel: {
    type: String,
    required: true
  },
  entityCode: {
    type: String,
    required: true
  }
});

roleSchema.index({
  tenantId: 1,
  applicationCode: 1,
  roleName: 1
}, {
  unique: true
});
roleSchema.index({
  tenantId: 1,
  applicationCode: 1,
  menuGroup: 1
}, {
  unique: true
});


module.exports = roleSchema;