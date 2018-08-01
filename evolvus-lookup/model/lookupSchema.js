const _ = require('lodash');
/*
 ** JSON Schema representation of the lookup model
 */
var lookupSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "lookupModel",
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
    "lookupCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 50,
      "filterable": true, //custom attributes
      "sortable": true //custom attributes
    },
    "value": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueOne": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueTwo": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueThree": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueFour": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueFive": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueSix": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueSeven": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueEight": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueNine": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "valueTen": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
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
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "updatedBy": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
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
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
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