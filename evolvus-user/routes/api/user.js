const debug = require("debug")("evolvus-platform-server:routes:api:user");
const _ = require("lodash");
const user = require("./../../index");

const LIMIT = process.env.LIMIT || 10;
const tenantHeader = "X-TENANT-ID";
const userHeader = "X-USER";
const ipHeader = "X-IP-HEADER";
const PAGE_SIZE = 10;

const userAttributes = ["tenantId", "entityCode", "accessLevel", "applicationCode", "contact", "role", "userId", "designation", "userName", "userPassword", "saltString", "enabledFlag", "activationStatus", "processingStatus", "createdBy", "createdDate", "lastUpdatedDate", "deletedFlag", "token", "masterTimeZone", "masterCurrency"];
const filterAttributes = user.filterAttributes;


module.exports = (router) => {

    router.route('/user/')
        .get((req, res, next) => {
            const tenantId = req.header(tenantHeader);
            const createdBy = req.header(userHeader);
            const ipAddress = req.header(ipHeader);
            const response = {
                "status": "200",
                "description": "",
                "data": {}
            };
            debug("query: " + JSON.stringify(req.query));
            var limit = _.get(req.query, "limit", LIMIT);
            var pageSize = _.get(req.query, "pageSize", PAGE_SIZE);
            var pageNo = _.get(req.query, "pageSize", 1);
            var skipCount = (pageNo - 1) * pageSize;
            var filter = _.pick(req.query, filterAttributes);
            var sort = _.get(req.query, "sort", {});
            var orderby = sortable(sort);

            try {
                user.find(tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit)
                    .then((users) => {
                        if (users.length > 0) {
                            response.status = "200";
                            response.description = "SUCCESS";
                            response.data = users;
                            res.status(200)
                                .send(JSON.stringify(response, null, 2));
                        } else {
                            response.status = "204";
                            response.description = "No users found";
                            debug("response: " + JSON.stringify(response));
                            res.status(200)
                                .send(JSON.stringify(response, null, 2));
                        }
                    })
                    .catch((e) => {
                        debug(`failed to fetch all users ${e}`);
                        res.status(400)
                            .json({
                                error: e.toString()
                            });
                    });
            } catch (e) {
                debug(`caught exception ${e}`);
                res.status(400)
                    .json({
                        error: e.toString()
                    });
            }
        });

    router.route("/user/")
        .post((req, res, next) => {
            try {
                console.log("body object is =>", req.body);

                const tenantId = req.header(tenantHeader);
                const createdBy = req.header(userHeader);
                const ipAddress = req.header(ipHeader);
                const response = {
                    "status": "200",
                    "description": "",
                    "data": {}
                };
                let object = _.pick(req.body, userAttributes);
                object.tenantId = tenantId;
                object.createdDate = new Date().toISOString();
                object.lastUpdatedDate = object.createdDate;
                console.log("object", object);

                user.save(tenantId, ipAddress, createdBy, object).then((savedUser) => {
                    response.status = "200";
                    response.description = `New User ${object.userName} has been added successfully.`;
                    response.data = savedUser;
                    res.status(200)
                        .send(JSON.stringify(response, null, 2));
                }).catch((e) => {
                    console.log("e1", e);

                    response.status = "400";
                    response.description = e.toString();
                    response.data = {};
                    res.status(400)
                        .send(JSON.stringify(response, null, 2));
                });
            } catch (e) {
                console.log("e2", e);

                response.status = "400";
                response.description = e.toString();
                response.data = {};
                res.status(400)
                    .send(JSON.stringify(response, null, 2));
            }
        });
};




function sortable(sort) {
    if (typeof sort === 'undefined' ||
        sort == null) {
        return {};
    }
    if (typeof sort === 'string') {
        var result = sort.split(",")
            .reduce((temp, sortParam) => {
                if (sortParam.charAt(0) == "-") {
                    return _.assign(temp, _.fromPairs([
                        [sortParam.replace(/-/, ""), -1]
                    ]));
                } else {
                    return _.assign(_.fromPairs([
                        [sortParam.replace(/\+/, ""), 1]
                    ]));
                }
            }, {});
        return result;
    } else {
        return {};
    }
}