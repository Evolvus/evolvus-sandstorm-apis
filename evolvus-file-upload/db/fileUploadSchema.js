const mongoose = require("mongoose");
const validator = require("validator");

var fileUploadSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: false
  },
  wfInstanceId: {
    type: String,
    required: false
  },
  processingStatus: {
    type: String,
    required: false
  },
  fileIdentification: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: false
  },
  fileType: {
    type: String,
    required: false
  },
  fileUploadStatus: {
    type: String,
    required: false
  },
  totalTransaction: {
    type: String,
    required: false
  },
  count: {
    type: String,
    required: false
  },
  totalProcessedUserCount: {
    type: String,
    required: false
  },
  totalFailedUserCount: {
    type: String,
    required: false
  },
  uploadedBy: {
    type: String,
    required: false
  },
  successLog: {
    type: String,
    required: false
  },
  errorLog: {
    type: String,
    required: false
  },
  uploadDateAndTime: {
    type: Date,
    required: false
  },
  enableFlag: {
    type: String,
    enum: ["true", "false"],
    default: "true"
  },
  createdBy: {
    type: String,
    required: false
  },
  updatedBy: {
    type: String,
    required: false
  },
  createdDate: {
    type: Date,
    required: false
  },
  lastUpdatedDate: {
    type: Date,
    required: false
  }
});

module.exports = fileUploadSchema;