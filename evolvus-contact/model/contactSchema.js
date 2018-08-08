const _ = require('lodash');

var contactSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "contactModel",
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
    "firstName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false
    },
    "middleName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false
    },
    "lastName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "filterable": false,
      "sortable": false
    },
    "emailId": {
      "type": "string",
      "minLength": 8,
      "maxLength": 50,
      "unique": false,
      "filterable": true,
      "sortable": true
    },
    "emailVerified": {
      "type": "boolean"
    },
    "phoneNumber": {
      "type": "string",
      "minLength": 9,
      "maxLength": 15,
      "unique": false,
      "filterable": false,
      "sortable": false
    },
    "mobileNumber": {
      "type": "string",
      "minLength": 9,
      "maxLength": 15,
      "unique": false,
      "filterable": false,
      "sortable": false
    },
    "mobileVerified": {
      "type": "boolean"
    },
    "faxNumber": {
      "type": "string",
      "minLength": 1,
      "maxLength": 10,
      "filterable": false,
      "sortable": false
    },
    "companyName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64,
      "filterable": false,
      "sortable": false
    },
    "address1": {
      "type": "string"
    },
    "address2": {
      "type": "string"
    },
    "city": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "state": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "country": {
      "type": "string",
      "filterable": false,
      "sortable": false
    },
    "zipCode": {
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
      "type": ["string", "null"],
      "format": "date-time",
      "filterable": false,
      "sortable": false
    }
  },
  "required": ["emailId", "city", "state", "country"]
};

module.exports.schema = contactSchema;

filterAttributes = _.keys(_.pickBy(contactSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(contactSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;