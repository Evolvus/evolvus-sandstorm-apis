module.exports = function(router) {

    require('./api/api')(router);

    router.use(function(req, res, next) {
        console.log("================================main.js");

        // make sure we go to the next routes and don't stop here
        next();
    });
};