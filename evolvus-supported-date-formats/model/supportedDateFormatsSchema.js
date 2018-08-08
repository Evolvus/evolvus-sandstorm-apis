const _ = require('lodash');

var supportedDateFormatsSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "supportedDateFormatsModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64,
      "filterable": true,
      "sortable": true
    },
    "wfInstanceId": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "wfInstanceStatus": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "formatCode": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false

    },
    "timeFormat": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false

    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
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
    "createdBy": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": false,
      "sortable": false
    },
    "updatedBy": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": false,
      "sortable": false
    },
    "objVersion": {
      "type": "number",
      "filterable": false,
      "sortable": false
    },
    "enableFlag": {
      "type": "string",
      "default": "1",
      "enum": ["0", "1"],
      "filterable": false,
      "sortable": false
    }
  },
  "required": ["tenantId", "formatCode"]
};

module.exports.schema = supportedDateFormatsSchema;

filterAttributes = _.keys(_.pickBy(supportedDateFormatsSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(supportedDateFormatsSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;