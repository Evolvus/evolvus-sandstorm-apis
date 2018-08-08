module.exports = [{
    /* 1 */
    "txnType": [
      "UPDATE_USER",
      "CREATE_ROLE",
      "UPDATE_ROLE"
    ],
    "selectedFlag": false,
    "processingStatus": "AUTHORIZED",
    "roleName": "CONSOLE-DEVELOPER",
    "applicationCode": "SANDSTORM",
    "description": "This is role console-developer",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
      "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "roleManagement",
          "title": "Role Management",
          "menuItemOrder": 1,
          "link": "roleManagement",
          "icon": "evo-role",
          "selectedFlag": false,
          "subMenuItems": []
        }

      ],
      "deletedFlag": 0,
      "selectedFlag": false,
      "menuGroupCode": "Administration",
      "title": "ADMINISTRATION",
      "applicationCode": "SANDSTORM",
      "tenantId": "T001",
      "createdBy": "SYSTEM",
      "menuGroupOrder": 1,
      "createdDate": new Date(),
      "lastUpdatedDate": new Date(),
      "__v": 0
    }],
    "roleType": "MAKER",
    "associatedUsers": 5,
    "tenantId": "T001",
    "createdBy": "SYSTEM",
    "entityId": "H001B001",
    "createdDate": new Date(),
    "lastUpdatedDate": new Date(),
    "wfInstanceId" : "",
    "wfInstanceStatus" : ""

  },
  {
    /* 2 */
    "txnType": [
      "UPDATE_USER",
      "UPDATE_ROLE",
      "AMEND_MANDATE"
    ],
    "selectedFlag": false,
    "processingStatus": "AUTHORIZED",
    "roleName": "CONSOLE_CHECKER",
    "applicationCode": "SANDSTORM",
    "description": "Console Checker",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
      "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "roleManagement",
          "title": "Role Management",
          "menuItemOrder": 1,
          "link": "roleManagement",
          "icon": "evo-role",
          "selectedFlag": false,
          "subMenuItems": [{
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "approve-role",
              "title": "Approve",
              "menuItemOrder": 1,
              "link": "approve",
              "icon": "evo-approve",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reprocess-role",
              "title": "Reprocess",
              "menuItemOrder": 2,
              "link": "reprocess",
              "icon": "evo-reprocess",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reject-role",
              "title": "Reject",
              "menuItemOrder": 3,
              "link": "reject",
              "icon": "evo-reject",
              "selectedFlag":false
            }
          ]
        },
        {
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "entityManagement",
          "title": "Entity Management",
          "menuItemOrder": 2,
          "link": "entityManagement",
          "icon": "evo-entity",
          "subMenuItems": [{
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "approve-entity",
              "title": "Approve",
              "menuItemOrder": 1,
              "link": "approve",
              "icon": "evo-approve",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reprocess-entity",
              "title": "Reprocess",
              "menuItemOrder": 2,
              "link": "reprocess",
              "icon": "evo-reprocess",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reject-entity",
              "title": "Reject",
              "menuItemOrder": 3,
              "link": "reject",
              "icon": "evo-reject",
              "selectedFlag": false
            }
          ],
          "selectedFlag": false
        },
        {
          "menuItemType": "menu",
          "applicationCode": "SANDSTORM",
          "menuItemCode": "userManagement",
          "title": "User Management",
          "menuItemOrder": 2,
          "link": "userManagement",
          "icon": "evo-user",
          "selectedFlag": false,
          "subMenuItems": [{
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "approve-user",
              "title": "Approve",
              "menuItemOrder": 1,
              "link": "approve",
              "icon": "evo-approve",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reprocess-user",
              "title": "Reprocess",
              "menuItemOrder": 2,
              "link": "reprocess",
              "icon": "evo-reprocess",
              "selectedFlag": false
            },
            {
              "menuItemType": "button",
              "applicationCode": "SANDSTORM",
              "menuItemCode": "reject-user",
              "title": "Reject",
              "menuItemOrder": 3,
              "link": "reject",
              "icon": "evo-reject",
              "selectedFlag": false
            }
          ]
        }
      ],
      "deletedFlag": 0,
      "selectedFlag":false,
      "menuGroupCode": "Administration",
      "title": "ADMINISTRATION",
      "applicationCode": "SANDSTORM",
      "tenantId": "T001",
      "createdBy": "SYSTEM",
      "menuGroupOrder": 1,
      "createdDate": new Date(),
      "lastUpdatedDate": new Date(),
      "__v": 0
    }],
    "roleType": "CHECKER",
    "associatedUsers": 5,
    "tenantId": "T001",
    "createdBy": "sriharig",
    "entityId": "H001B001",
    "createdDate": new Date(),
    "lastUpdatedDate": new Date(),
        "__v": 0,
    "updatedBy": "kavyakm",
    "wfInstanceId" : "",
    "wfInstanceStatus" : ""
  },
  {
    /* 3 */
    "txnType": [
      "UPDATE_USER",
      "CREATE_ROLE"
    ],
    "selectedFlag": false,
    "processingStatus": "AUTHORIZED",
    "roleName": "CDA-MAKER101",
    "applicationCode": "FLUX_CDA",
    "description": "CDA Maker",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "bulkupload",
            "title": "Bulk Upload",
            "icon": "",
            "link": "/bulkupload",
            "menuItemOrder": 0,
            "subMenuItems": [],
            "selectedFlag":false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "mandate",
            "title": "Nach Mandates",
            "icon": "",
            "link": "/mandate",
            "menuItemOrder": 2,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "directdebitmandate",
            "title": "Direct Debit Mandate",
            "icon": "",
            "link": "",
            "menuItemOrder": 3,
            "subMenuItems": [],
            "selectedFlag":false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "emandate",
            "title": "Emandates",
            "icon": "",
            "link": "",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag":false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "outwardpayment",
            "title": "Outward Payments",
            "icon": "",
            "link": "",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "enquiry",
            "title": "Enquiry",
            "icon": "",
            "link": "/enquiry",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag":false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "dashboard",
            "title": "Dashboard",
            "icon": "",
            "link": "/dashboard",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          }
        ],
        "deletedFlag": 0,
        "selectedFlag":false,

        "menuGroupCode": "matmenugroup",
        "title": "MainMenu",
        "applicationCode": "FLUX_CDA",
        "tenantId": "T001",
        "createdBy": "Nishanth",
        "menuGroupOrder": 1,
        "createdDate": new Date(),
        "lastUpdatedDate": new Date()
      },
      {
        "menuItems": [{
          "menuItemType": "menu",
          "applicationCode": "FLUX_CDA",
          "menuItemCode": "enquiry2",
          "title": "File Enquiry",
          "icon": "assets/images/Artboard 2.svg",
          "link": "/enquiry",
          "menuItemOrder": 0,
          "subMenuItems": [],
          "selectedFlag": false
        }],
        "deletedFlag": 0,
        "selectedFlag": false,
        "menuGroupCode": "bulkmenugroup",
        "title": "BulkUploadMenu",
        "applicationCode": "FLUX_CDA",
        "tenantId": "T001",
        "createdBy": "Nishanth",
        "menuGroupOrder": 2,
        "createdDate": new Date(),
        "lastUpdatedDate": new Date()
      }
    ],
    "roleType": "MAKER",
    "associatedUsers": 5,
    "tenantId": "T001",
    "createdBy": "sriharig",
    "entityId": "H001B001",
    "createdDate": new Date(),
    "lastUpdatedDate": new Date(),
    "__v": 0,
    "wfInstanceId" : "",
    "wfInstanceStatus" : "",
    "updatedBy": "kavyakm"
  },
  {
    /* 4 */
    "txnType": [
      "UPDATE_USER"
    ],
    "selectedFlag":false,
    "processingStatus": "AUTHORIZED",
    "roleName": "CDA_CHECKER",
    "applicationCode": "FLUX_CDA",
    "description": "Checker",
    "activationStatus": "ACTIVE",
    "menuGroup": [{
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "bulkupload",
            "title": "Bulk Upload",
            "icon": "",
            "link": "/bulkupload",
            "menuItemOrder": 0,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "mandate",
            "title": "Nach Mandates",
            "icon": "",
            "link": "/mandate",
            "menuItemOrder": 2,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "directdebitmandate",
            "title": "Direct Debit Mandate",
            "icon": "",
            "link": "",
            "menuItemOrder": 3,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "emandate",
            "title": "Emandates",
            "icon": "",
            "link": "",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "outwardpayment",
            "title": "Outward Payments",
            "icon": "",
            "link": "",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "enquiry",
            "title": "Enquiry",
            "icon": "",
            "link": "/enquiry",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "dashboard",
            "title": "Dashboard",
            "icon": "",
            "link": "/dashboard",
            "menuItemOrder": 4,
            "subMenuItems": [],
            "selectedFlag": false
          }
        ],
        "deletedFlag": 0,
        "selectedFlag":false,
        "menuGroupCode": "matmenugroup",
        "title": "MainMenu",
        "applicationCode": "FLUX_CDA",
        "tenantId": "T001",
        "createdBy": "Nishanth",
        "menuGroupOrder": 1,
        "createdDate": new Date(),
        "lastUpdatedDate": new Date()
      },
      {
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "enquiry2",
            "title": "File Enquiry",
            "icon": "assets/images/Artboard 2.svg",
            "link": "/enquiry",
            "menuItemOrder": 0,
            "subMenuItems": [],
            "selectedFlag": false
          },
          {
            "menuItemType": "submenu",
            "applicationCode": "FLUX_CDA",
            "menuItemCode": "filesummary",
            "title": "File Summary",
            "icon": "assets/images/file-summary.svg",
            "link": "",
            "menuItemOrder": 1,
            "subMenuItems": [{
                "menuItemType": "submenu",
                "applicationCode": "FLUX_CDA",
                "menuItemCode": "mandateuploadgrid",
                "title": "Mandate File Summary",
                "icon": "",
                "link": "/mandateuploadgrid",
                "menuItemOrder": 0,
                "selectedFlag": false
              },
              {
                "menuItemType": "submenu",
                "applicationCode": "FLUX_CDA",
                "menuItemCode": "paymentuploadgrid",
                "title": "Payment File Summary",
                "icon": "",
                "link": "/paymentuploadgrid",
                "menuItemOrder": 1,
                "selectedFlag": false
              }
            ],
            "selectedFlag": false
          }
        ],
        "deletedFlag": 0,
        "selectedFlag": false,
        "menuGroupCode": "bulkmenugroup",
        "title": "BulkUploadMenu",
        "applicationCode": "FLUX_CDA",
        "tenantId": "T001",
        "createdBy": "Nishanth",
        "menuGroupOrder": 2,
        "createdDate": new Date(),
        "lastUpdatedDate": new Date()
      }
    ],
    "roleType": "CHECKER",
    "associatedUsers": 5,
    "tenantId": "T001",
    "createdBy": "CDAMAKER",
    "entityId": "H001B001",
    "createdDate": new Date(),
    "lastUpdatedDate": new Date(),
    "__v": 0,
    "wfInstanceId" : "",
    "wfInstanceStatus" : "",
    "updatedBy": "CDACHECKER"
  }
]
