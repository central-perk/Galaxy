var path = require("path"),
  express = require("express"),
  compression = require("compression"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  favicon = require("serve-favicon"),
  errorHandler = require("errorhandler"),
  logger = require("morgan"),
  multer = require("multer");

var env = context.env,
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  filePath = context.filePath,
  CONFIG_APP = config.APP;

module.exports = function (app, passport, mongoose) {
  // development environment
  if (app.get("env") === "dev") {
    app.use(errorHandler());
    app.use(logger("dev")); // log every request
  }
  // Production Environment
  // if (app.get('env') === 'pro') {
  // return;
  // }

  // middleware for res
  app.use(function (req, res, next) {
    res.success = function (data) {
      return res.json({
        code: 200,
        msg: data,
      });
    };
    res.error = function (data) {
      return res.json({
        code: 15000,
        msg: data,
      });
    };
    res.pSuccess = function (data) {
      return res.jsonp({
        code: 200,
        msg: data,
      });
    };
    res.pError = function (data) {
      return res.jsonp({
        code: 15000,
        msg: data,
      });
    };
    next();
  });

  app.set("port", CONFIG_APP.port);

  app.enable("jsonp callback");

  // compress requests and responses
  app.use(compression()); // need further settings
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // Node.js middleware for handling `multipart/form-data`.
  app.use(multer());
};
