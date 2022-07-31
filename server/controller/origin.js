var async = require("async"),
  _ = require("lodash"),
  config = context.config,
  util = context.util,
  originDao = util.getDao("origin"),
  CVAR = config.CVAR;

// create
exports.create = function (logs, callback) {
  var _log;
  if (_.isArray(logs)) {
    _log = [];
    _.forEach(logs, function (log) {
      _log.push(assembleLog(log));
    });
  } else {
    _log = assembleLog(logs);
  }
  originDao.create(_log, callback);
};

// log assembly
function assembleLog(log) {
  var data = {
    siteID: log.idsite,
    r: log.r,
    url: log.url,
    visitorID: log.vid,
    ua: log.ua,
    IP: log.ip,
    sr: log.res,
    ref: log.urlref,
    visitTS: Number(log._viewts) || Number(new Date()),
  };
  if (
    log.cvar &&
    JSON.parse(log.cvar)[CVAR.channel] &&
    JSON.parse(log.cvar)[CVAR.channel][1]
  ) {
    data.channel = JSON.parse(log.cvar)[CVAR.channel][1];
  }
  return data;
}
