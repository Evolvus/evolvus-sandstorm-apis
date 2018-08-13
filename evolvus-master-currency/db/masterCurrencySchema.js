const mongoose = require("mongoose");
const validator = require("validator");


var masterCurrencySchema = new mongoose.Schema({
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
  currencyCode: {
    type: String,
    minLength: 1,
    maxLength: 5,
    required: true
  },
  currencyName: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true

  },
  decimalDigit: {
    type: String

  },
  delimiter: {
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
  objVersion: {
    type: Number
  },
  enableFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true",
    filterable: true,
    sortable: true
  },
  currencyLocale: {
    type: String
  }

});
module.exports = masterCurrencySchema;

masterCurrencySchema.index({
  tenantId: 1,
  currencyName: 1
}, {
  unique: true
});

module.exports = masterCurrencySchema;