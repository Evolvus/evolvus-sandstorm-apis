// module.exports.validObject1 = {
//   // valid entity object
//   "tenantId": "T001",
//   "wfInstanceId": "wfID",
//   "entityCode": "entity1",
//   "name": "headOffice",
//   "parent": "headOffice",
//   "description": "bc1 description",
//   "createdBy": "SYSTEM",
//   "createdDate": "2018-07-05T12:25:22.895Z",
//   "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
//   "accessLevel": "1",
//   "enableFlag": "1",
//   "entityId": "abc12"
// };

module.exports.validObject1 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "southZone",
  "name": "southZone",
  "parent": "HeadOffice",
  "description": "southZone description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-07-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
  "enableFlag": "true"
};

module.exports.validObject2 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "entity3",
  "name": "NORTHZONE",
  "parent": "HeadOffice",
  "description": "northZone description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-05-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-05-05T12:25:22.895Z",
  "enableFlag": "true"
};

module.exports.validObject3 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "wfID",
  "entityCode": "entity4",
  "name": "tamilNadu",
  "parent": "SOUTHZONE",
  "description": "tamilNadu description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "enableFlag": "true"
};

module.exports.validObject4 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "entity5",
  "name": "karnataka",
  "parent": "SOUTHZONE",
  "description": "southZone description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "enableFlag": "true"
};

module.exports.validObject5 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "entity6",
  "name": "mumbai",
  "parent": "NORTHZONE",
  "description": "mumbai description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "enableFlag": "true"
};

module.exports.validObject6 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "entity7",
  "name": "maharastra",
  "parent": "NORTHZONE",
  "description": "maharastra description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "enableFlag": "true"
};

module.exports.validObject7 = {
  // valid entity object
  "tenantId": "T001",
  "wfInstanceId": "",
  "entityCode": "entity8",
  "name": "chennai",
  "parent": "TAMILNADU",
  "description": "chennai description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-07-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
  "enableFlag": "true"
};

module.exports.invalidObject1 = {
  // invalid entity object
  "tenantId": "IVL",
  "parent": "headOffice",
  "description": "northZone description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "enableFlag": "1"
};

module.exports.seeddata1 = {
  "tenantId": "T001",
  "entityCode": "HeadOffice",
  "name": "HeadOffice",
  "parent": "HeadOffice",
  "description": "HeadOffice Entity",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "0",
  "entityId": "H001B001",
  "enableFlag": "true"
};
module.exports.seeddata2 = {
  "tenantId": "T002",
  "entityCode": "HeadOffice",
  "name": "HeadOffice",
  "parent": "HeadOffice",
  "description": "HeadOffice Entity",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "0",
  "entityId": "H001B002",
  "enableFlag": "true"
};
