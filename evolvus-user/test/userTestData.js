module.exports.validObject1 = {
  // valid user object
  "contact": {
    "emailId": "srihari@gmail.com",
    "city": "Banglore",
    "state": "karnataka",
    "country": "India"
  },
  "entityId": "H001B001",
  "applicationCode": "CONSOLE",
  "role": {
    "_id": ("5b4447e5e4280016d07dca8e"),
    "processingStatus": "PENDING_AUTHORIZATION",
    "roleName": "ADMIN",
    "applicationCode": "SANDSTORM",
    "description": "This is Role Admin",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
      "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "roleManagement",
          "title": "Role Management",
          "menuItemOrder": 1,
          "selectedFlag": true
        },
        {
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "entityManagement",
          "title": "Entity Management",
          "menuItemOrder": 2,
          "selectedFlag": true
        },
        {
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "userManagement",
          "title": "User Management",
          "menuItemOrder": 2,
          "selectedFlag": true
        }
      ],
      "deletedFlag": "false",
      "_id": ("5b3dc5c9ceb4a22b122d313c"),
      "menuGroupCode": "Administration",
      "title": "ADMINISTRATION",
      "applicationCode": "SANDSTORM",
      "tenantId": "T001",
      "createdBy": "pavithra",
      "menuGroupOrder": 1,
      "createdDate": ("2018-07-05T07:16:25.983Z"),
      "lastUpdatedDate": ("2018-07-05T07:16:25.983Z"),
      "__v": 0
    }],
    "associatedUsers": 5,
    "tenantId": "IVL",
    "createdBy": "sriharig",
    "entityId": "H001B001",
    "accessLevel": "0",
    "createdDate": ("2018-07-10T05:45:09.293Z"),
    "lastUpdatedDate": ("2018-07-23T10:41:39.942Z"),
    "__v": 0,
    "txnType": [
      "UPDATE_USER",
      "CREATE_ROLE"
    ],
    "updatedBy": "sriharig",
    "roleType": "CHECKER"
  },
  "userId": "SRIHARI",
  "tenantId": "T001",
  "userName": "sriharig",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "0",
  "createdBy": "SYSTEM",
  "enabledFlag": "true",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};


module.exports.validObject2 = {
  // valid user object
  "tenantId": "T001",
  "contact": {
    "emailId": "kavya@gmail.com",
    "city": "Banglore",
    "state": "karnataka",
    "country": "India"
  },
  "entityId": "H001B00159P1B",
  "applicationCode": "CONSOLE",
  "role": {
    "_id": ("5b4446d49da183126a2dc666"),
    "processingStatus": "AUTHORIZED",
    "roleName": "TESTER",
    "applicationCode": "SANDSTORM",
    "description": "This is Banker Role",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
        "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "roleManagement",
          "title": "Role Management",
          "menuItemOrder": 1,
          "selectedFlag": true
        }],
        "deletedFlag": "false",
        "_id": ("5b3dc5c9ceb4a22b122d313c"),
        "menuGroupCode": "Administration",
        "title": "ADMINISTRATION",
        "applicationCode": "SANDSTORM",
        "tenantId": "T001",
        "createdBy": "pavithra",
        "menuGroupOrder": 1,
        "createdDate": ("2018-07-05T07:16:25.983Z"),
        "lastUpdatedDate": ("2018-07-05T07:16:25.983Z"),
        "__v": 0
      },
      {
        "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "reasonCode",
          "title": "Reason Code",
          "menuItemOrder": 2,
          "selectedFlag": true
        }],
        "deletedFlag": "false",
        "_id": ("5b3dc5d3ceb4a22b122d313d"),
        "menuGroupCode": "maintenance",
        "title": "MAINTENANCE",
        "applicationCode": "SANDSTORM",
        "tenantId": "T001",
        "createdBy": "pavithra",
        "menuGroupOrder": 2,
        "createdDate": ("2018-07-05T07:16:35.898Z"),
        "lastUpdatedDate": ("2018-07-05T07:16:35.898Z"),
        "__v": 0
      },
      {
        "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "systemConfiguration",
          "title": "System Configuration",
          "menuItemOrder": 1,
          "selectedFlag": true
        }],
        "deletedFlag": "false",
        "_id": ("5b3dc5dcceb4a22b122d313e"),
        "menuGroupCode": "configuration",
        "title": "CONFIGURATION",
        "applicationCode": "SANDSTORM",
        "tenantId": "T001",
        "createdBy": "pavithra",
        "menuGroupOrder": 3,
        "createdDate": ("2018-07-05T07:16:44.190Z"),
        "lastUpdatedDate": ("2018-07-05T07:16:44.190Z"),
        "__v": 0
      }
    ],
    "associatedUsers": 5,
    "tenantId": "IVL",
    "createdBy": "sriharig",
    "entityId": "H001B001",
    "accessLevel": "0",
    "createdDate": ("2018-07-10T05:40:36.118Z"),
    "lastUpdatedDate": ("2018-07-18T13:04:30.036Z"),
    "__v": 0,
    "txnType": [],
    "updatedBy": "sriharig"
  },
  "userId": "KAVYAKM",
  "userName": "kavyak",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "1",
  "enabledFlag": "true",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};

module.exports.validObject3 = {
  // valid user object
  "tenantId": "T001",
  "contact": {
    "emailId": "pavithra@gmail.com",
    "city": "Banglore",
    "state": "karnataka",
    "country": "India"
  },
  "entityId": "H001B001",
  "applicationCode": "PLF",
  "role": {
    "_id": ("5b430f527b914b618083759e"),
    "menuGroup": [{
      "tenantId": "tid",
      "applicationCode": "RTP-CONSOLE",
      "menuGroupCode": "mgc",
      "title": "menugroup title",
      "menuGroupOrder": 1,
      "createdBy": "SYSTEM",
      "createdDate": "2018-07-09T07:31:30.774Z",
      "menuItems": [{
          "createdBy": "SYSTEM",
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "micc",
          "title": "menuItem title",
          "menuItemOrder": 1
        },
        {
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "mmic",
          "title": "menuItem title",
          "createdBy": "SYSTEM",
          "menuItemOrder": 1
        }
      ]
    }],
    "processingStatus": "AUTHORIZED",
    "tenantId": "IVL",
    "roleName": "OPS",
    "applicationCode": "DOCKET",
    "description": "ops role",
    "activationStatus": "ACTIVE",
    "associatedUsers": 5,
    "accessLevel": "0",
    "createdBy": "IVL",
    "entityId": "H001B001",
    "createdDate": ("2018-07-09T07:31:30.812Z"),
    "lastUpdatedDate": ("2018-07-09T07:31:30.812Z"),
    "__v": 0
  },
  "userId": "PAVITHRA",
  "userName": "pavithra",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "1",
  "enabledFlag": "true",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};

module.exports.validObject4 = {
  // valid user object
  "tenantId": "T001",
  "contact": {
    "emailId": "kamala@gmail.com",
    "city": "Banglore",
    "state": "karnataka",
    "country": "India"
  },
  "entityId": "H001B001",
  "applicationCode": "CONSOLE",
  "role": {
    "_id": ("5b3f68b21c17bc7df12740fc"),
    "menuGroup": [{
      "tenantId": "tid",
      "applicationCode": "RTP-CONSOLE",
      "menuGroupCode": "mgcc2",
      "menuGroupOrder": 1,
      "title": "menugroup title",
      "createdBy": "SYSTEM",
      "createdDate": "2018-07-06T13:03:46.027Z",
      "menuItems": [{
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "micc",
          "title": "menuItem title",
          "menuItemOrder": 1
        },
        {
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "mmic",
          "title": "menuItem title",
          "menuItemOrder": 1
        }
      ]
    }],
    "processingStatus": "AUTHORIZED",
    "roleName": "DEVELOPER",
    "applicationCode": "CDA",
    "description": "testing SAVE",
    "activationStatus": "ACTIVE",
    "associatedUsers": 5,
    "accessLevel": "0",
    "tenantId": "IVL",
    "createdBy": "user",
    "entityId": "H001B001",
    "createdDate": ("2018-07-06T13:03:46.039Z"),
    "lastUpdatedDate": ("2018-07-06T13:03:46.039Z"),
    "__v": 0
  },
  "userId": "KAMALA",
  "userName": "kamala",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "2",
  "enabledFlag": "false",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};

module.exports.validObject5 = {
  // valid user object
  "tenantId": "T001",
  "contact": {
    "emailId": "visgnesh@gmail.com",
    "city": "Banglore",
    "state": "karnataka",
    "country": "India"
  },
  "entityId": "H001B001",
  "applicationCode": "PLF",
  "role": {
    "_id": "5b3f67e71c17bc7df12740fa",
    "menuGroup": [{
      "tenantId": "tid",
      "applicationCode": "RTP-CONSOLE",
      "menuGroupCode": "mgcc",
      "menuGroupOrder": 1,
      "title": "menugroup title",
      "createdBy": "SYSTEM",
      "createdDate": "2018-07-06T13:00:23.161Z",
      "menuItems": [{
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "micc",
          "link": "l",
          "icon": "evo_role",
          "title": "menuItem title",
          "menuItemOrder": 1
        },
        {
          "menuItemType": "queues",
          "applicationCode": "RTP-CONSOLE",
          "menuItemCode": "mmic",
          "title": "menuItem title",
          "menuItemOrder": 1
        }
      ]
    }],
    "processingStatus": "AUTHORIZED",
    "roleName": "BANKER",
    "applicationCode": "CDA",
    "description": "role banker",
    "activationStatus": "ACTIVE",
    "associatedUsers": 5,
    "accessLevel": "0",
    "tenantId": "IVL",
    "createdBy": "user",
    "entityId": "H001B001",
    "createdDate": ("2018-07-06T13:00:23.216Z"),
    "lastUpdatedDate": ("2018-07-06T13:00:23.216Z"),
    "__v": 0
  },
  "userId": "VIGNESH",
  "userName": "vignesh",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "2",
  "createdBy": "SYSTEM",
  "enabledFlag": "false",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};


module.exports.invalidObject1 = {
  "tenantId": "T001",
  "entityId": "H001B001",
  "applicationCode": "CONSOLE",
  "userName": "sriharig",
  "userPassword": "evolvus*123",
  "saltString": "$2a$10$bVAXH8ck.PlRGRv1AEb5ye",
  "accessLevel": "0",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "masterTimeZone": "IST",
  "masterCurrency": "INR"
};

module.exports.entityObject = {
  "tenantId": "IVL",
  "wfInstanceId": "wfID",
  "wfInstanceStatus": "wfStatus",
  "entityCode": "entity1",
  "name": "headOffice",
  "parent": "headOffice",
  "description": "bc1 description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-07-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
  "accessLevel": "1",
  "enableFlag": 1,
  "entityId": "H001B001"
};

module.exports.roleObject = {
  "tenantId": "IVL",
  "entityId": "Entity2",
  "accessLevel": "1",
  "applicationCode": "CDA",
  "enableFlag": "true",
  "roleName": "Supervisor",
  "roleType": "CHECKER",
  "txnType": ["BANKING"],
  "wfInstanceId": "wfID",
  "wfInstanceStatus": "wfStatus",
  "menuGroup": [{
    "tenantId": "tid",
    "applicationCode": "CDA",
    "menuGroupCode": "mgc1",
    "menuGroupOrder": 1,
    "createdDate": new Date().toISOString(),
    "createdBy": "user",
    "title": "menugroup title",
    "menuItems": [{
      "menuItemType": "queues",
      "applicationCode": "CDA",
      "menuItemOrder": 1,
      "menuItemCode": "mic",
      "title": "menuItem title"
    }, {
      "menuItemType": "queues",
      "applicationCode": "RTP",
      "menuItemOrder": 2,
      "menuItemCode": "mic",
      "title": "menuItem title"
    }]
  }],
  "processingStatus": "PENDING_AUTHORIZATION",
  "description": "admin_One decription *",
  "activationStatus": "ACTIVE",
  "associatedUsers": 5,
  "createdBy": "kamalarani",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString()
};