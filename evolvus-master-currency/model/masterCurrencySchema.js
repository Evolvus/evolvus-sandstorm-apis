const _ = require('lodash');


var masterCurrencySchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "masterCurrencyModel",
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
    "processingStatus": {
      "type": "string",
      "default": "IN_PROGRESS",
      "filterable": true,
      "sortable": true,
      "displayable": true
    },
    "currencyCode": {
      "type": "string",
      "minLength": 1,
      "maxLength": 5,
      "unique": true,
      "filterable": false,
      "sortable": false
    },
    "currencyName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false

    },
    "decimalDigit": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "delimiter": {
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
    },
    "currencyLocale": {
      "type": "string",
      "filterable": false,
      "sortable": false

    }
  },
  "required": ["tenantId", "currencyCode", "currencyName"]
};

module.exports.schema = masterCurrencySchema;

filterAttributes = _.keys(_.pickBy(masterCurrencySchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(masterCurrencySchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;