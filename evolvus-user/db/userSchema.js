const mongoose = require('mongoose');
const validator = require('validator');

const role = require('evolvus-role');
const contact = require("evolvus-contact");

var userSchema = new mongoose.Schema({
    // Add all attributes below tenantId
    tenantId: {
        type: String,
        required: true,
        min: 1,
        max: 64
    },
    userId: {
        type: String,
        required: true,
        min: 6,
        max: 35,
        validate: {
            validator: function(v) {
                return /^[ A-Za-z0-9_-]*$/.test(v);
            },
            message: "{PATH} can contain only alphanumeric and _ -"
        }
    },
    applicationCode: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    contact: contact.db,
    entityCode: {
        type: String,
        minLength: 5,
        maxLength: 100,
        required: true
    },
    role: role.db,
    userName: {
        type: String,
        min: 6,
        max: 140,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9!@#$&()\\-`.+,/\"]*$/.test(v);
            },
            message: "{PATH} can contain only alphanumeric and specialcharacters"
        },
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
        default: "1"
    },
    deletedFlag: {
        type: String,
        default: "0"
    },
    activationStatus: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    processingStatus: {
        type: String,
        enum: ['PENDING_AUTHORIZATION', 'AUTHORIZED', 'REJECTED'],
        default: 'PENDING_AUTHORIZATION'
    },
    token: {
        type: String
    },
    supportedDateFormats: {
        type: String
    },
    masterCurrency: {
        type: String,
        required: true
    },
    masterTimeZone: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        min: 6,
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
        minLength: 16,
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
        minLength: 16,
        maxLength: 16,
        validate: {
            validator: function(v) {
                return /^[0-9.]*$/.test(v);
            },
            message: "{PATH} can contain only numbers and . "
        }
    }
});

userSchema.index({
    tenantId: 1,
    userId: 1,
    role: 1
}, {
    unique: true
});

userSchema.index({
    tenantId: 1,
    userId: 1
}, {
    unique: true
});

module.exports = userSchema;