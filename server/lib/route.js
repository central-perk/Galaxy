var path = require("path"),
  fs = require("fs-extra"),
  _ = require("lodash"),
  router = require("express").Router(),
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  filePath = context.filePath;

// route root directory
var routeDirPath = dirPath.route;

// route file path
var routeMappingPath = path.join(routeDirPath, "mapping");

// route middleware path
var routeMWPath = path.join(routeDirPath, "middleware");

var mw = require(routeMWPath);

module.exports = function (app) {
  // All routes start with /api/analytics
  app.use("/api/analytics", router);

  // Register the route in the mapping folder
  _.forEach(fs.readdirSync(routeMappingPath), function (routeFileName, index) {
    if (/\.js$/.test(routeFileName)) {
      var routeFilePath = path.join(routeMappingPath, routeFileName),
        ctrlName = routeFileName.replace(".js", ""),
        ctrl = util.getCtrl(ctrlName);

      require(routeFilePath)(app, router, mw, ctrl);
    }
  });
};
