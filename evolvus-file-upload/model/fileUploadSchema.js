const _ = require('lodash');
/*
 ** JSON Schema representation of the fileUpload model
 */
var fileUploadSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "fileUploadModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "wfInstanceId": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "processingStatus": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "fileIdentification": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "fileName": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "fileType": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "fileUploadStatus": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "totalTransaction": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "count": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "totalProcessedUserCount": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute
    },
    "totalFailedUserCount": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute

    },
    "uploadedBy": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute

    },
    "successLog": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute

    },
    "errorLog": {
      "type": "string",
      "filterable": true, //custom attributes
      "sortable": true //custom attribute

    },
    "uploadDateAndTime": {
      "type": ["string", "null"],
      "format": "date-time",
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
  }

};

module.exports.schema = fileUploadSchema;

filterAttributes = _.keys(_.pickBy(fileUploadSchema.properties, (a) => {
  return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(fileUploadSchema.properties, (a) => {
  return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;
module.exports.schema = fileUploadSchema;