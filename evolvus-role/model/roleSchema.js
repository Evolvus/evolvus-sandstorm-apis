const _ = require('lodash');
/*
 ** JSON Schema representation of the role model
 */
var roleSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "roleModel",
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
    "wfInstanceStatus": {
      "type": "string",
      "minLength": 3,
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
                      },
                      "selectedFlag": {
                        "type": "string",
                        "enum": ["0", "1"],
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
};

module.exports.schema = roleSchema;

filterAttributes = _.keys(_.pickBy(roleSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(roleSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;