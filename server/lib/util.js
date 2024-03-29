var path = require("path"),
  fs = require("fs-extra"),
  _ = require("lodash"),
  moment = require("moment"),
  url = require("url");

// register context
exports.setContext = function (serverPath) {
  var self = this,
    rootPath = path.join(serverPath, ".."),
    configPath = path.join(serverPath, "config");

  global.context = {
    env: process.env.NODE_ENV,
    config: require(configPath),
    util: self,
    // folder path
    dirPath: {
      root: rootPath,
      server: serverPath,
      log: path.join(rootPath, "log"),
      config: configPath,
      controller: path.join(serverPath, "controller"),
      dao: path.join(serverPath, "dao"),
      lib: path.join(serverPath, "lib"),
      model: path.join(serverPath, "model"),
      route: path.join(serverPath, "route"),
      test: path.join(serverPath, "test"),
    },
    // file path
    filePath: {},
  };

  // sub-file path under lib folder
  libPath = context.dirPath.lib;

  _.forEach(fs.readdirSync(libPath), function (fileName) {
    if (~fileName.indexOf(".js")) {
      fileName = fileName.replace(".js", "");
      context.filePath[fileName] = path.join(libPath, fileName);
    }
  });

  context.pkgJSON = require(path.join(rootPath, "package.json"));

  this.registerModels();
  this.registerDaos();
};

// register model
exports.registerModels = function () {
  _.forEach(fs.readdirSync(context.dirPath.model), function (fileName) {
    if (/\.js$/.test(fileName)) {
      var modelName = fileName.replace(".js", ""),
        modelPath = path.join(context.dirPath.model, fileName);
      require(modelPath);
    }
  });
};

// register dao
exports.registerDaos = function () {
  require(context.dirPath.dao);
};

exports.getCtrl = function (ctrlName) {
  return require(path.join(context.dirPath.controller, ctrlName));
};

exports.getDao = function (daoName) {
  return require(context.dirPath.dao)[daoName];
};

// Format
exports.dateTimeFormat = function (date) {
  return getUTC(date).format("YYYY-MM-DD HH:mm");
};

// timestamp
exports.tsFormat = function (date) {
  return Number(moment(date).format("x"));
};

// year, month, day, hour, minute, second
exports.lineTimeFormat = function (date) {
  return getUTC(date).format("YYYYMMDDHHmmss");
};

// difference in minutes
exports.diffMinutes = function (date1, date2) {
  date1 = moment(date1);
  date2 = date2 || moment();
  return Math.floor(Math.abs(date1.diff(date2, "minutse")) / 60000);
};

// difference in days
exports.diffDays = function (date1, date2, isTs) {
  if (isTs) {
    date1 = this.getStartTime(date1);
    date2 = this.getEndTime(date2);
  }
  date1 = moment(Number(date1));
  date2 = moment(Number(date2));
  return Math.abs(date2.diff(date1, "days"));
};

// interval date
exports.amongDays = function (date1, date2, format) {
  if (Number(date1) > Number(date2)) {
    var tmp = date1;
    date1 = date2;
    date2 = tmp;
  }
  format = format || "MM-DD";
  var diffDays = exports.diffDays(date1, date2);
  var days = [];
  for (var i = 0; i <= diffDays; i++) {
    days.push(moment(date1).add(i, "d").format(format));
  }
  return days;
};

// Get the start time of the day
exports.getStartTime = function (date) {
  date = Number(date) || new Date().getTime();
  return moment(date).startOf("day").clone().toDate();
};

// Get the end of day time
exports.getEndTime = function (date) {
  date = Number(date) || new Date().getTime();
  return moment(date).endOf("day").clone().toDate();
};

function getUTC(date) {
  return moment(date).utcOffset(8);
}

// random string
exports.randomStr = function (length) {
  var chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split(""),
    str = "";
  length = length || 8;
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

// Formal environment
exports.isPro = function () {
  return context.env === "pro";
};

// development environment
exports.isDev = function () {
  return context.env === "dev";
};

// error handling
exports.errHandler = function (err, doc, callback) {
  if (err) console.log(err);
  callback(err, doc);
};

// source analysis
exports.getRef = function (log) {
  if (log.ua) {
    var reg = log.ua.toLowerCase().match(/MicroMessenger/i);
    if (reg && reg.length && reg[0] === "micromessenger") {
      return "weixin";
    }
  }

  var host = "",
    refUrl = log.urlref;
  CONFIG_REF = context.config.REF;
  if (refUrl) host = url.parse(refUrl).host;
  return host && CONFIG_REF[host] ? CONFIG_REF[host] : "websites";
};
