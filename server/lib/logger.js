/**
 * Logger log module
 * @author Terry
 * @data 2014-9-24
 * @param logName
 * @param query
 * @example logger.info(logName,record);
 */

var request = require("request"),
  path = require("path"),
  url = require("url"),
  request = request.defaults({
    json: true,
  }),
  config = {
    host: "http://logger.echuandan.com/",
    appid: "x9QmoO",
    token: "f3aafa98b0cfd01d3fe9a2892a8ec2fd",
  },
  host = config.host;

function Logger() {
  this.host = config.host;
  this.appid = config.appid;
  this.token = config.token;
  this.env = process.env.NODE_ENV || "development";
  this.levelCodes = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  };
}

Logger.prototype.log = function () {
  var args = Array.prototype.slice.call(arguments);
  Logger.prototype.report.apply(this, args);
};

["Trace", "Debug", "Info", "Warn", "Error", "Fatal"].forEach(function (
  levelString
) {
  var level = levelString.toLowerCase();

  Logger.prototype[level] = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.levelCodes[level]);
    Logger.prototype.log.apply(this, args);
  };
});

Logger.prototype.makeQuery = function (data) {
  var query = [];
  for (var i in data) {
    if (data[i] || data[i] === 0) {
      query.push(i + "=" + data[i]);
    }
  }
  return query.join("&");
};

Logger.prototype.report = function (level, logname, record) {
  var self = this;
  record._level = level;
  record.env = this.env;

  var query = self.makeQuery(record),
    apiPath = path.join(
      "upload",
      "app",
      this.appid,
      "logname",
      logname,
      "token",
      this.token
    ),
    api = url.resolve(this.host, apiPath) + "?" + query;
  var req = request.get(api, function (err, res) {
    if (err) {
      console.log("[Request Error] %s", err);
      return;
    }
    // if (res && res.body) {
    // console.log('[Succeed Report Log] %s', res.body.msg);
    // } else {
    // console.log("[Log callback error] %s", res);
    // }
  });
  //end request
  req.end();
};

var logger = new Logger();

module.exports = logger;
