const mongoose = require("mongoose");
const validator = require("validator");

var contactSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    minLength: 1,
    maxLength: 64
  },
  wfInstanceId: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  processingStatus: {
    type: String,
    default: "IN_PROGRESS"
  },
  firstName: {
    type: String,
    minLength: 1,
    maxLength: 50
  },
  middleName: {
    type: String,
    minLength: 1,
    maxLength: 50
  },
  lastName: {
    type: String,
    minLength: 1,
    maxLength: 50
  },
  emailId: {
    type: String,
    minLength: 8,
    maxLength: 140
  },
  emailVerified: {
    type: Boolean
  },
  phoneNumber: {
    type: String,
    maxLength: 10,
    validate: {
      validator: function(v) {
        return /^(\s*|\d+)$/.test(v);
      },
      message: "{PATH} can contain only Numbers"
    }
  },
  mobileNumber: {
    type: String,
    maxLength: 10,
    validate: {
      validator: function(v) {
        return /^(\s*|\d+)$/.test(v);
      },
      message: "{PATH} can contain only Numbers"
    }
  },
  mobileVerified: {
    type: Boolean
  },
  faxNumber: {
    type: String,
    maxLength: 10,
    validate: {
      validator: function(v) {
        return /^(\s*|\d+)$/.test(v);
      },
      message: "{PATH} can contain only Numbers"
    }
  },
  companyName: {
    type: String,
    minLength: 1,
    maxLength: 64
  },
  address1: {
    type: String
  },
  address2: {
    type: String
  },
  city: {
    type: String,
    required: false,
    maxLength: 20,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z ]+$/.test(v);
      },
      message: "{PATH} can contain only Alphabets and Spaces"
    }
  },
  state: {
    type: String,
    required: false,
    maxLength: 20,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z ]+$/.test(v);
      },
      message: "{PATH} can contain only Alphabets and Spaces"
    }
  },
  country: {
    type: String,
    required: false,
    maxLength: 20,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z ]+$/.test(v);
      },
      message: "{PATH} can contain only Alphabets and Spaces"
    }
  },
  zipCode: {
    type: String
  },
  createdDate: {
    type: Date
  },
  lastUpdatedDate: {
    type: Date
  }
});



module.exports = contactSchema;
contactSchema.index({
  tenantId: 1,
  emailId: 1
}, {
  unique: true
});
module.exports = contactSchema;