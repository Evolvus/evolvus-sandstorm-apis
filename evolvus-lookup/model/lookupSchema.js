const _ = require('lodash');

var lookupSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "lookupModel",
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
      "maxLength": 20,
      "filterable": true,
      "sortable": true
    },
    "processingStatus": {
      "type": "string",
      "default": "IN_PROGRESS",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "lookupCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 50,
      "filterable": true,
      "sortable": true
    },
    "value": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": true,
      "sortable": true
    },
    "valueOne": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueTwo": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueThree": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueFour": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueFive": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueSix": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueSeven": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueEight": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueNine": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "valueTen": {
      "type": "string",
      "filterable": true,
      "sortable": true
    },
    "enableFlag": {
      "type": "string",
      "enum": ["true", "false"],
      "default": "true",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "createdBy": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "updatedBy": {
      "type": "string",
      "filterable": true,
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
      "filterable": true,
      "sortable": true
    }
  },
  "required": ["tenantId", "lookupCode", "value", "createdBy", "createdDate"]
};

module.exports.schema = lookupSchema;

filterAttributes = _.keys(_.pickBy(lookupSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(lookupSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;
module.exports.schema = lookupSchema;