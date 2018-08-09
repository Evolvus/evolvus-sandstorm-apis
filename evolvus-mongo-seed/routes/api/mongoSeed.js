var fs = require('fs');
const fse = require('fs-extra');
const mongoSeed = require('./../../index.js');
var Engine = require('velocity').Engine

const {
  seedDatabase
} = require('mongo-seeding');

var configuration = mongoSeed.dbconfigure;
var fileConfig = mongoSeed.fileconfigure;

module.exports = (router) => {
  router.route('/mongoSeed')
    .post((req, res, next) => {
      const ctx = {
        tenantId: req.query.tenantId,
        entityId: req.query.entityId || 'H001B001'
      };

      configuration.database.name = req.query.dbname;
      configuration.database.port = req.query.port;
      configuration.database.host = req.query.host;
      configuration.database.username = req.query.username;
      configuration.database.userpassword = req.query.password;

      create(fileConfig, ctx, () => {

        seedDatabase(configuration).then(() => {
          res.send("Your SeedData Added SuccessFully");
        }).catch(err => {
          res.send("Unable to Add SeedData");
        });

      });
    });
};

function create(files, ctx, callback) {


  files.forEach(file => {

    const outputdir = file.outputdir;

    const finalDir = `${outputdir}/${file.mkpath}`;
    if (!fs.existsSync(finalDir)) {

      fs.mkdirSync(finalDir);

    }

    var engine = new Engine({
      "template": file.template,
      "output": `${finalDir}/${file.fileName}`
    });
    var result = engine.render(ctx);

  });
  callback();
}