var _ = require("lodash"),
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  filePath = context.filePath,
  kue = util.getCtrl("kue"),
  CONFIG_PV_WEIGHT = config.PV.weight;

// Data collection
exports.collect = function (req, res) {
  var log = req.query;

  log.ua = req.headers["user-agent"];

  log.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // add pv weights
  log.weight = 1;

  // join the log task queue
  kue.enqueueLog(log);

  // Collect statistical results and directly return the image type
  res.writeHead(200, {
    "Content-Type": "image/webp",
  });
  res.end(null);
};

// Set the weight of the current request
function getWeight(log) {
  var cvar,
    firstPubTime,
    weight = 1;
  if (log.cvar) {
    try {
      cvar = JSON.parse(log.cvar);
    } catch (e) {
      console.log("cvar", log.cvar);
      return weight;
    }

    firstPubTime = cvar["2"] && cvar["2"][1];
    if (
      firstPubTime &&
      util.diffDays(new Date(), firstPubTime) > 0 &&
      util.diffDays(new Date(), firstPubTime) < 14
    ) {
      weight = _.random(CONFIG_PV_WEIGHT[0], CONFIG_PV_WEIGHT[1]);
    }
  }
  return weight;
}
