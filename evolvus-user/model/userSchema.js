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
      "filterable": true,
      "sortable": false,
      "displayable": false
    },
    "tenantName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64,
      "filterable": true,
      "sortable": false,
      "displayable": false
    },
    "_id": {
      "filterable": true,
      "sortable": false
    },
    "uniquereferenceid": {
      "type": "string",
      "filterable": true,
      "sortable": false,
    },
    "wfInstanceId": {
      "type": "string",
      "maxLength": 20,
      "filterable": true,
      "sortable": false,
      "displayable": false
    },
    "userId": {
      "type": "string",
      "minLength": 6,
      "maxLength": 35,
      "pattern": "^[A-Za-z0-9_-]*$",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "userName": {
      "type": "string",
      "minLength": 6,
      "maxLength": 140,
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "userPassword": {
      "type": "string",
      "minLength": 5,
      "maxLength": 64,
      "filterable": false,
      "sortable": false,
      "displayable": false
    },
    "saltString": {
      "type": "string",
      "filterable": false,
      "sortable": false,
      "displayable": false
    },
    "token": {
      "type": "string",
      "filterable": false,
      "sortable": false,
      "displayable": false
    },
    "loginStatus": {
      "type": "string",
      "enum": [
        "LOGGED_IN",
        "LOGGED_OUT"
      ],
      "default": "LOGGED_OUT",
      "filterable": true,
      "sortable": false,
      "displayable": true
    },
    "supportedDateFormats": {
      "type": "string",
      "filterable": false,
      "sortable": false,
      "displayable": true
    },
    "masterCurrency": {
      "type": "string",
      "filterable": false,
      "sortable": false,
      "displayable": true
    },
    "masterTimeZone": {
      "type": "string",
      "filterable": false,
      "sortable": false,
      "displayable": true
    },
    "entityId": {
      "type": "string",
      "minLength": 5,
      "maxLength": 100,
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "createdBy": {
      "type": "string",
      "filterable": false,
      "sortable": true,
      "displayable": true
    },
    "updatedBy": {
      "type": "string",
      "filterable": false,
      "sortable": true,
      "displayable": true
    },
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "filterable": false,
      "sortable": true,
      "displayable": true
    },
    "lastUpdatedDate": {
      "type": "string",
      "format": "date-time",
      "filterable": false,
      "sortable": true,
      "displayable": true
    },
    "enabledFlag": {
      "type": "string",
      "enum": ["true", "false"],
      "default": "true",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "deletedFlag": {
      "type": "string",
      "enum": ["true", "false"],
      "default": "false",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "accessLevel": {
      "type": "string",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "activationStatus": {
      "type": "string",
      "enum": [
        "ACTIVE",
        "INACTIVE"
      ],
      "default": "INACTIVE",
      "filterable": true,
      "sortable": false,
      "displayable": true
    },
    "processingStatus": {
      "type": "string",
      "default": "IN_PROGRESS",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "dailyLimit": {
      "type": "number",
      "minLength": 16,
      "maxLength": 16,
      "filterable": false,
      "sortable": false,
      "displayable": false
    },
    "individualTransactionLimit": {
      "type": "number",
      "minLength": 16,
      "maxLength": 16,
      "filterable": false,
      "sortable": false,
      "displayable": false
    },
    "designation": {
      "type": "string",
      "maxLength": 35,
      "filterable": false,
      "sortable": false,
      "displayable": true
    },
    "role": {
      "type": "object",
      "properties": {
        "tenantId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "filterable": true, //custom attributes
          "sortable": false //custom attribute
        },
        "roleType": {
          "type": "string",
          "minLength": 5,
          "maxLength": 30,
          "filterable": true, //custom attributes
          "sortable": false //custom attribute
        },
        "txnType": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "wfInstanceId": {
          "type": "string",
          "minLength": 0,
          "maxLength": 20
        },
        "applicationCode": {
          "type": "string",
          "minLength": 3,
          "maxLength": 20,
          "filterable": true, //custom attributes
          "sortable": true //custom attributes
        },
        "roleName": {
          "type": "string",
          "minLength": 6,
          "maxLength": 100,
          "pattern": "^[a-zA-Z-0-9-_ ]+$",
          "message": "RoleName can contain only alphanumeric and two specialcharacters hyphen and underscore",
          "filterable": true, //custom attributes
          "sortable": true //custom attributes
        },
        "enableFlag": {
          "type": "string",
          "enum": ["true", "false"],
          "filterable": true, //custom attributes
          "sortable": true //custom attributes
        },
        "createdBy": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": true //custom attributes
        },
        "updatedBy": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": true //custom attributes
        },
        "createdDate": {
          "type": "string",
          "format": "date-time",
          "filterable": true, //custom attributes
          "sortable": true //custom attributes
        },
        "lastUpdatedDate": {
          "type": ["string", "null"],
          "format": "date-time",
          "filterable": false, //custom attributes
          "sortable": true //custom attributes
        },
        "selectedFlag": {
          "type": "boolean",
          "default": false,
          "filterable": false, //custom attributes
          "sortable": false //custom attributes
        },
        "activationStatus": {
          "type": "string",
          "enum": ["ACTIVE", "INACTIVE"],
          "minLength": 1,
          "displayable": true,
          "filterable": true, //custom attributes
          "sortable": false //custom attributes
        },
        "processingStatus": {
          "type": "string",
          "default": 'IN_PROGRESS',
          "displayable": true,
          "filterable": true, //custom attributes
          "sortable": true //custom attributes
        },
        "associatedUsers": {
          "type": "number",
          "minLength": 1,
          "maxLength": 10,
          "filterable": false, //custom attributes
          "sortable": false //custom attributes
        },
        "accessLevel": {
          "type": "string",
          "filterable": true, //custom attributes
          "sortable": false //custom attributes
        },
        "entityId": {
          "type": "string",
          "filterable": true, //custom attributes
          "sortable": false //custom attributes
        },
        "menuGroup": {
          "type": "array",
          "minItems": 1,
          "message": "Menus are required",
          "items": {
            "properties": {
              "tenantId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 64,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "selectedFlag": {
                "type": "boolean",
                "default": false,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "applicationCode": {
                "type": "string",
                "minLength": 3,
                "maxLength": 20,
                "filterable": true, //custom attributes
                "sortable": false //custom attributes
              },
              "menuGroupCode": {
                "type": "string",
                "minLength": 1,
                "maxLength": 20,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 20,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "createdBy": {
                "type": "string",
                "minLength": 1,
                "maxLength": 30,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "updatedBy": {
                "type": "string",
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "createdDate": {
                "type": "string",
                "format": "date-time",
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "lastUpdatedDate": {
                "type": "string",
                "format": "date-time",
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "enableFlag": {
                "type": "string",
                "enum": ["true", "false"],
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
              },
              "menuGroupOrder": {
                "type": "number",
                "minLength": 1,
                "maxLength": 10,
                "filterable": false, //custom attributes
                "sortable": false //custom attributes
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
                      "filterable": false, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "selectedFlag": {
                      "type": "boolean",
                      "default": false,
                      "filterable": false, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "applicationCode": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 20,
                      "filterable": true, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "menuItemCode": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20,
                      "filterable": false, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "icon": {
                      "type": "string",
                      "minLength": 0,
                      "maxLength": 30
                    },
                    "link": {
                      "type": "string",
                      "minLength": 0,
                      "maxLength": 30
                    },
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20,
                      "filterable": false, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "menuItemOrder": {
                      "type": "number",
                      "minLength": 1,
                      "maxLength": 10,
                      "filterable": false, //custom attributes
                      "sortable": false //custom attributes
                    },
                    "subMenuItems": {
                      "type": "array",
                      "items": {
                        "properties": {
                          "menuItemType": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20,
                            "filterable": false, //custom attributes
                            "sortable": false //custom attributes
                          },
                          "applicationCode": {
                            "type": "string",
                            "minLength": 3,
                            "maxLength": 20,
                            "filterable": true, //custom attributes
                            "sortable": false //custom attributes
                          },
                          "selectedFlag": {
                            "type": "boolean",
                            "default": false,
                            "filterable": false, //custom attributes
                            "sortable": false //custom attributes
                          },
                          "menuItemCode": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20,
                            "filterable": false, //custom attributes
                            "sortable": false //custom attributes
                          },
                          "icon": {
                            "type": "string",
                            "minLength": 0,
                            "maxLength": 30
                          },
                          "link": {
                            "type": "string",
                            "minLength": 0,
                            "maxLength": 30
                          },
                          "title": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20,
                            "filterable": false, //custom attributes
                            "sortable": false //custom attributes
                          },
                          "menuItemOrder": {
                            "type": "number",
                            "required": "true",
                            "filterable": false, //custom attributes
                            "sortable": false //custom attributes
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "description": {
          "type": "string",
          "minLength": 0,
          "maxLength": 255,
          "filterable": false, //custom attributes
          "sortable": false, //custom attributes
          "displayable": true
        }
      }
    },
    "contact": {
      "type": "object",
      "properties": {
        "tenantId": {
          "type": "string",
          "maxLength": 64,
          "filterable": true, //custom attributes
          "sortable": true //custom attribute
        },
        "wfInstanceId": {
          "type": "string",
          "minLength": 3,
          "maxLength": 20,
          "filterable": true, //custom attributes
          "sortable": true //custom attribute
        },
        "processingStatus": {
          "type": "string",
          "default": "IN_PROGRESS",
          "filterable": true,
          "sortable": true,
          "displayable": true
        },
        "firstName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "middleName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "lastName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "emailId": {
          "type": "string",
          "minLength": 8,
          "maxLength": 50,
          "unique": false,
          "filterable": true, //custom attributes
          "sortable": true //custom attribute
        },
        "emailVerified": {
          "type": "boolean"
        },
        "phoneNumber": {
          "type": "string",
          "maxLength": 10,
          "unique": false,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "mobileNumber": {
          "type": "string",
          "maxLength": 10,
          "unique": false,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "mobileVerified": {
          "type": "boolean"
        },
        "faxNumber": {
          "type": "string",
          "maxLength": 10,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "companyName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "address1": {
          "type": "string"
        },
        "address2": {
          "type": "string"
        },
        "city": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "state": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "country": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "zipCode": {
          "type": "string",
          "filterable": false, //custom attributes
          "sortable": false //custom attribute
        },
        "createdDate": {
          "type": "string",
          "format": "date-time",
          "filterable": false, //custom attributes
          "sortable": false //custom attributes
        },
        "lastUpdatedDate": {
          "type": ["string", "null"],
          "format": "date-time",
          "filterable": false, //custom attributes
          "sortable": false //custom attributes
        }
      }
    }
  },
  "required": [
    "tenantId",
    "userId",
    "userName",
    "userPassword",
    "createdBy",
    "createdDate",
    "lastUpdatedDate",
    "contact",
    "role",
    "entityId"
  ]
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