const _ = require('lodash');

var masterTimeZoneSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "masterTimeZoneModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
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
    "zoneCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "filterable": true,
      "sortable": true
    },
    "zoneName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": true,
      "sortable": true
    },
    "offsetValue": {
      "type": "string"
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
    "updatedDate": {
      "type": ["string", "null"],
      "format": "date-time",
      "filterable": false,
      "sortable": false
    },
    "offSet": {
      "type": "string"
    },
    "objVersion": {
      "type": "number"
    },
    "enableFlag": {
      "type": "string",
      "default": "1",
      "enum": ["0", "1"]
    }
  },
  "required": ["tenantId", "zoneCode", "zoneName"]
};

module.exports.schema = masterTimeZoneSchema;

filterAttributes = _.keys(_.pickBy(masterTimeZoneSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(masterTimeZoneSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;