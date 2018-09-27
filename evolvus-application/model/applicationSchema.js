const _ = require('lodash');

var applicationSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "applicationModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "maxLength": 64,
      "filterable": true,
      "sortable": true
    },
    "_id": {
      "filterable": true,
      "sortable": false
    },
    "processingStatus": {
      "type": "string",
      "default": "IN_PROGRESS",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "wfInstanceId": {
      "type": "string",
      "minLength": 0,
      "maxLength": 20,
      "filterable": true,
      "sortable": true
    },
    "applicationCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "filterable": true,
      "sortable": true
    },
    "applicationName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": true,
      "sortable": true,
      "pattern": '^[A-Za-z ]*$',
      "message": "applicationName can contain only alphabets and spaces"

    },
    "accessLevel": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "enabledFlag": {
      "type": "string",
      "enum": ["true", "false"],
      "default": "true",
      "filterable": true,
      "sortable": true,
    },
    "logo": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "entityId": {
      "type": "string",
      "minLength": 5,
      "maxLength": 100,
      "filterable": true,
      "sortable": false
    },
    "favicon": {
      "type": "string",
      "filterable": false,
      "sortable": false
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
    "description": {
      "type": "string",
      "minLength": 0,
      "maxLength": 255,
      "filterable": false,
      "sortable": false,
      "displayable": true
    }
  },
  "required": ["tenantId", "applicationName", "applicationCode"]
};

module.exports.schema = applicationSchema;

filterAttributes = _.keys(_.pickBy(applicationSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(applicationSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;

module.exports.schema = applicationSchema;