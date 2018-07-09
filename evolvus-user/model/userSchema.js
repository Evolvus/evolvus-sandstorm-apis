const _ = require('lodash');
/*
 ** JSON Schema representation of the user model
 */
var userSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "userModel",
    "type": "object",
    "properties": {
        "tenantId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 64,
            "filterable": false,
            "sortable": false
        },
        "userId": {
            "type": "string",
            "minLength": 6,
            "maxLength": 35,
            "pattern": "^[ A-Za-z0-9_-]*$",
            "filterable": true,
            "sortable": true
        },
        "userName": {
            "type": "string",
            "minLength": 1,
            "maxLength": 64,
            "pattern": "^[a-zA-Z0-9!@#$&()\\-`.+,/\"]*$",
            "filterable": true,
            "sortable": true
        },
        "userPassword": {
            "type": "string",
            "minLength": 1,
            "maxLength": 64,
            "filterable": false,
            "sortable": false
        },
        "saltString": {
            "type": "string",
            "filterable": false,
            "sortable": false
        },
        "token": {
            "type": "string",
            "filterable": false,
            "sortable": false
        },
        "supportedDateFormats": {
            "type": "string",
            "filterable": false,
            "sortable": false
        },
        "masterCurrency": {
            "type": "string",
            "filterable": false,
            "sortable": false
        },
        "masterTimeZone": {
            "type": "string",
            "filterable": false,
            "sortable": false
        },
        "entityId": {
            "type": "string",
            "minLength": 5,
            "maxLength": 100,
            "filterable": true,
            "sortable": true
        },
        "createdBy": {
            "type": "string",
            "filterable": false,
            "sortable": true
        },
        "updatedBy": {
            "type": "string",
            "filterable": false,
            "sortable": true
        },
        "createdDate": {
            "type": "string",
            "format": "date-time",
            "filterable": false,
            "sortable": true
        },
        "lastUpdatedDate": {
            "type": "string",
            "format": "date-time",
            "filterable": false,
            "sortable": true
        },
        "enabledFlag": {
            "type": "string",
            "default": "1",
            "filterable": true,
            "sortable": true
        },
        "deletedFlag": {
            "type": "string",
            "default": "0",
            "filterable": true,
            "sortable": true
        },
        "activationStatus": {
            "type": "string",
            "enum": ["ACTIVE", "INACTIVE"],
            "filterable": true,
            "sortable": false
        },
        "processingStatus": {
            "type": "string",
            "enum": ["PENDING_AUTHORIZATION", "AUTHORIZED", "REJECTED"],
            "default": "PENDING_AUTHORIZATION",
            "filterable": true,
            "sortable": false
        },
        "dailyLimit": {
            "type": "number",
            "minLength": 16,
            "maxLength": 16,
            "filterable": false,
            "sortable": false
        },
        "individualTransactionLimit": {
            "type": "number",
            "minLength": 16,
            "maxLength": 16,
            "filterable": false,
            "sortable": false
        },
        "designation": {
            "type": "string",
            "minLength": 6,
            "maxLength": 35,
            "filterable": false,
            "sortable": false
        },
        "role": {
            "type": "object",
            "properties": {
                "tenantId": {
                    "type": "string",
                    "maxLength": 64,
                    "filterable": true,
                    "sortable": false //custom attribute
                },
                "applicationCode": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 20,
                    "filterable": true,
                    "sortable": true
                },
                "roleName": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 100,
                    "filterable": true,
                    "sortable": true
                },
                "enableFlag": {
                    "type": "string",
                    "enum": ["0", "1"],
                    "filterable": true,
                    "sortable": true
                },
                "createdBy": {
                    "type": "string",
                    "filterable": false,
                    "sortable": true
                },
                "updatedBy": {
                    "type": "string",
                    "filterable": false,
                    "sortable": true
                },
                "createdDate": {
                    "type": "string",
                    "format": "date-time",
                    "filterable": true,
                    "sortable": true
                },
                "lastUpdatedDate": {
                    "type": ["string", "null"],
                    "format": "date-time",
                    "filterable": false,
                    "sortable": true
                },
                "selectedFlag": {
                    "type": "string",
                    "enum": ["0", "1"],
                    "filterable": false,
                    "sortable": false
                },
                "activationStatus": {
                    "type": "string",
                    "enum": ["ACTIVE", "INACTIVE"],
                    "displayable": true,
                    "filterable": true,
                    "sortable": false
                },
                "processingStatus": {
                    "type": "string",
                    "enum": ['PENDING_AUTHORIZATION', 'AUTHORIZED', 'REJECTED'],
                    "default": 'PENDING_AUTHORIZATION',
                    "displayable": true,
                    "filterable": true,
                    "sortable": false
                },
                "associatedUsers": {
                    "type": "number",
                    "filterable": false,
                    "sortable": false
                },
                "accessLevel": {
                    "type": "string",
                    "filterable": false,
                    "sortable": false
                },
                "entityCode": {
                    "type": "string",
                    "filterable": false,
                    "sortable": false
                },
                "menuGroup": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "properties": {
                            "tenantId": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 64,
                                "filterable": false,
                                "sortable": false
                            },
                            "applicationCode": {
                                "type": "string",
                                "minLength": 3,
                                "maxLength": 20,
                                "filterable": true,
                                "sortable": false
                            },
                            "menuGroupCode": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 20,
                                "filterable": false,
                                "sortable": false
                            },
                            "title": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 20,
                                "filterable": false,
                                "sortable": false
                            },
                            "createdBy": {
                                "type": "string",
                                "filterable": false,
                                "sortable": false
                            },
                            "updatedBy": {
                                "type": "string",
                                "filterable": false,
                                "sortable": false
                            },
                            "createdDate": {
                                "type": "string",
                                "format": "date-time",
                                "filterable": false,
                                "sortable": false
                            },
                            "lastUpdatedDate": {
                                "type": "string",
                                "format": "date-time",
                                "filterable": false,
                                "sortable": false
                            },
                            "enableFlag": {
                                "type": "string",
                                "enum": ["0", "1"],
                                "filterable": false,
                                "sortable": false
                            },
                            "menuGroupOrder": {
                                "type": "number",
                                "filterable": false,
                                "sortable": false
                            },
                            "menuItems": {
                                "type": "array",
                                "minItems": 1,
                                "items": {
                                    "properties": {
                                        "menuItemType": {
                                            "type": "string",
                                            "minLength": 1,
                                            "maxLength": 20,
                                            "filterable": false,
                                            "sortable": false
                                        },
                                        "applicationCode": {
                                            "type": "string",
                                            "minLength": 3,
                                            "maxLength": 20,
                                            "filterable": true,
                                            "sortable": false
                                        },
                                        "menuItemCode": {
                                            "type": "string",
                                            "minLength": 1,
                                            "maxLength": 20,
                                            "filterable": false,
                                            "sortable": false
                                        },
                                        "title": {
                                            "type": "string",
                                            "minLength": 1,
                                            "maxLength": 20,
                                            "filterable": false,
                                            "sortable": false
                                        },
                                        "menuItemOrder": {
                                            "type": "number",
                                            "required": "true",
                                            "filterable": false,
                                            "sortable": false
                                        }
                                    }
                                },
                                "required": ["menuItemType", "applicationCode", "menuItemCode", "title", "menuItemOrder"]
                            } //MENUiTEMS
                        }
                    },
                    "required": ["tenantId", "applicationCode", "menuGroupCode", "menuGroupOrder", "title", "createdDate", "createdBy", "menuItems"]
                },
                "description": {
                    "type": "string",
                    "minLength": 0,
                    "maxLength": 255,
                    "pattern": "^[ A-Za-z0-9_@./#&+-]*",
                    "filterable": false,
                    "sortable": false,
                    "displayable": true
                }
            },
            "required": ["tenantId", "applicationCode", "roleName", "menuGroup", "activationStatus", "associatedUsers", "createdBy", "createdDate", "lastUpdatedDate", "accessLevel", "entityCode"]
        },
        "contact": {
            "type": "object",
            "properties": {
                "firstName": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 50
                },
                "middleName": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 50
                },
                "lastName": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 50
                },
                "emailId": {
                    "type": "string",
                    "minLength": 8,
                    "maxLength": 140
                },
                "emailVerified": {
                    "type": "boolean"
                },
                "phoneNumber": {
                    "type": "string",
                    "minLength": 10,
                    "maxLength": 10
                },
                "mobileNumber": {
                    "type": "string",
                    "minLength": 10,
                    "maxLength": 10
                },
                "mobileVerified": {
                    "type": "boolean"
                },
                "faxNumber": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 15
                },
                "companyName": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 64
                },
                "Address1": {
                    "type": "string"
                },
                "Address2": {
                    "type": "string"
                },
                "city": {
                    "type": "string"
                },
                "state": {
                    "type": "string",
                    "maxLength": 140
                },
                "country": {
                    "type": "string"
                },
                "zipCode": {
                    "type": "string"
                }
            },
            "required": ["emailId", "state", "city", "country"]
        }
    },
    "required": ["tenantId", "userId", "applicationCode", "userName", "userPassword", "createdBy", "createdDate", "lastUpdatedDate", , "contact", "role", "entityCode"]
};


module.exports.schema = userSchema;


filterAttributes = _.keys(_.pickBy(userSchema.properties, (a) => {
    return (a.filterable);
}));



module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(userSchema.properties, (a) => {
    return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;