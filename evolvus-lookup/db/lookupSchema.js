const mongoose = require("mongoose");
const validator = require("validator");

var lookupSchema = new mongoose.Schema({
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
  lookupCode: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  value: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100
  },
  valueOne: {
    type: String,
    required: false
  },
  valueTwo: {
    type: String,
    required: false
  },
  valueThree: {
    type: String,
    required: false
  },
  valueFour: {
    type: String,
    required: false
  },
  valueFive: {
    type: String,
    required: false
  },
  valueSix: {
    type: String,
    required: false
  },
  valueSeven: {
    type: String,
    required: false
  },
  valueEight: {
    type: String,
    required: false
  },
  valueNine: {
    type: String,
    required: false
  },
  valueTen: {
    type: String,
    required: false
  },
  enableFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true"
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
  }
});

module.exports = lookupSchema;