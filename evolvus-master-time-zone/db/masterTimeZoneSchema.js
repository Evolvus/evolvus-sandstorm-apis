const mongoose = require("mongoose");
const validator = require("validator");

var masterTimeZoneSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 64
  },
  wfInstanceId: {
    type: String,
    minlength: 0,
    maxlength: 20
  },
  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },
  zoneCode: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true
  },
  zoneName: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true
  },
  offsetValue: {
    type: String
  },
  createdDate: {
    type: String,
    format: Date
  },
  lastUpdatedDate: {
    type: String,
    format: Date
  },
  createdBy: {
    type: String,
    minLength: 1,
    maxLength: 100
  },
  updatedBy: {
    type: String,
    minLength: 1,
    maxLength: 100
  },
  offSet: {
    type: String
  },
  objVersion: {
    type: Number
  },
  enableFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true",
    filterable: true,
    sortable: true
  }

});

module.exports = masterTimeZoneSchema;

masterTimeZoneSchema.index({
  tenantId: 1,
  zoneName: 2
}, {
  unique: true
});

module.exports = masterTimeZoneSchema;