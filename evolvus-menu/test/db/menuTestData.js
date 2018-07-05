module.exports.validObject1 = {
  // valid menu object
  "tenantId": "IVL",
  "applicationCode": "FLUX-CDA",
  "menuGroupCode": "Audit",
  "title": "AUDIT",
  "menuItems": [{
      "menuItemType": "menu",
      "applicationCode": "FLUX-CDA",
      "menuItemCode": "ROLE",
      "title": "Role Management",
      "menuItemOrder": 1
    },
    {
      "menuItemType": "menu",
      "applicationCode": "FLUX-CDA",
      "menuItemCode": "USER",
      "title": "Role Management",
      "menuItemOrder": 1
    }
  ],
  "menuGroupOrder": 1,
  "createdDate": new Date().toISOString(),
  "createdBy": "system",
  "lastUpdatedDate": new Date().toISOString()
};

module.exports.validObject2 = {
  // valid menu object
  "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "AuditOne",
        "title": "AUDITONE",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 2,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
};

module.exports.validObject3 = {
  // valid menu object
  "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "AuditTwo",
        "title": "AUDITTWO",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 3,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
};

module.exports.validObject4 = {
  // valid menu object
  "tenantId": "IVL",
          "applicationCode": "FLUX-CDA",
          "menuGroupCode": "AuditThree",
          "title": "AUDITTHREE",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "ROLE",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "USER",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 4,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
};

module.exports.validObject5 = {
  // valid menu object
  "tenantId": "IVL",
          "applicationCode": "CDA-OPERATION",
          "menuGroupCode": "AuditFour",
          "title": "AUDITFOUR",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "CDA-OPERATION",
              "menuItemCode": "ROLE",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "CDA-OPERATION",
              "menuItemCode": "USER",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 4,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
};

module.exports.validObject6 = {
  // valid menu object
  "tenantId": "IVL",
          "applicationCode": "CDA-OPERATION",
          "menuGroupCode": "AuditFive",
          "title": "AUDITFIVE",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "CDA-OPERATION",
              "menuItemCode": "ROLE",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "CDA-OPERATION",
              "menuItemCode": "USER",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 5,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
};

module.exports.validObject7 = {
  // valid menu object
  "tenantId": "IVL",
        "applicationCode": "CDA-OPERATION",
        "menuGroupCode": "AuditSix",
        "title": "AUDITSIX",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "CDA-OPERATION",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "CDA-OPERATION",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 7,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
};

module.exports.validObject8 = {
  // valid menu object
  "tenantId": "KOT",
        "applicationCode": "CDA-OPERATION",
        "menuGroupCode": "AuditSeven",
        "title": "AUDITSEVEN",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "CDA-OPERATION",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 8
          },
          {
            "menuItemType": "menu",
            "applicationCode": "CDA-OPERATION",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 8
          }
        ],
        "menuGroupOrder": 8,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
};

module.exports.invalidObject1 = {
  // invalid menu object
  menuName: "Docket",
  createdBy: "Kavya",
  createdDate: new Date()
    .toISOString(),
  enabled: false
};
