var async = require("async"),
  request = require("request"),
  cache = require("memory-cache"),
  _ = require("lodash"),
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  filePath = context.filePath,
  siteDao = util.getDao("site");
siteModel = siteDao.siteModel;

// create
exports.create = function (req, res) {
  var flyerID = req.body.flyerID,
    siteID = util.randomStr();

  if (!flyerID) return res.error("missing flyerID");
  async.auto(
    {
      // check flyerID uniqueness
      checkFlyerID: function (cb) {
        siteDao.findOne({ flyerID: flyerID }, cb);
      },
      // check siteID uniqueness
      checkSiteID: function (cb) {
        siteDao.findOne({ _id: siteID }, cb);
      },
    },
    function (err, results) {
      if (results.checkFlyerID) {
        // Return the flyer information if the flyer has been created
        res.success(results.checkFlyerID);
      } else if (results.checkSiteID) {
        res.error("The page ID is duplicated, the creation failed");
      } else {
        siteDao.create(
          {
            _id: siteID,
            flyerID: flyerID,
          },
          function (err, raw) {
            if (!err) {
              res.success(raw);
            } else {
              res.error("Service error, creation failed");
            }
          }
        );
      }
    }
  );
};

// get a single
exports.getByID = function (req, res) {
  var siteID = req.params.siteID;
  if (!siteID) return res.error("missing siteID");
  siteDao.findByID(siteID, function (err, site) {
    if (!err) {
      res.success(site);
    } else {
      res.error("The page does not exist or an error occurred");
    }
  });
};

// get PV
exports.getPV = function (req, res) {
  var siteID = req.params.siteID;
  if (!siteID) return res.error("missing siteID");
  siteDao.getPVByID(siteID, function (err, site) {
    if (!err) {
      res.success(site.pv);
    } else {
      res.error("The page does not exist or an error occurred");
    }
  });
};

// get ref
exports.getRef = function (req, res) {
  var siteID = req.params.siteID;
  if (!siteID) return res.error("missing siteID");
  siteDao.getRefByID(siteID, function (err, site) {
    if (!err) {
      res.success(site.ref);
    } else {
      res.error("The page does not exist or an error occurred");
    }
  });
};

// get overview
exports.getOverview = function (req, res) {
  var siteID = req.params.siteID;
  if (!siteID) return res.error("missing siteID");
  siteDao.getOverviewByID(siteID, function (err, site) {
    if (!err) {
      res.success(site);
    } else {
      res.error("The page does not exist or an error occurred");
    }
  });
};

// Get work PV based on flyerIDs
exports.listPV = function (req, res) {
  if (req.query.flyerIDs) {
    var flyerIDs = req.query.flyerIDs.split(","),
      _allCachedIDs = cache.keys();
    allCachedIDs = [];

    _.forEach(_allCachedIDs, function (flyerID) {
      if (cache.get(flyerID)) {
        allCachedIDs.push(flyerID);
      }
    });

    var cachedIDs = _.intersection(flyerIDs, allCachedIDs),
      uncachedIDs = _.difference(flyerIDs, allCachedIDs);

    // Get the site that has been cached and needs to be returned
    var cachedSites = _.reduce(
      cachedIDs,
      function (before, after) {
        before.push(cache.get(after)); // reference object may be cleared
        return before;
      },
      []
    );

    siteDao.listPV(
      { flyerID: { $in: uncachedIDs } },
      function (err, uncachedSites) {
        if (!err) {
          // Cache the obtained data and set the expiration time
          _.forEach(uncachedSites, function (site) {
            cache.put(site.flyerID, site, config.CACHE.expire.flyerID); // 5min
          });
          var allSites = _.merge(uncachedSites, cachedSites);
          res.pSuccess(allSites);
        } else {
          res.pSuccess([]);
        }
      }
    );
  } else {
    res.pSuccess([]);
  }
};

// real-time data update
exports.updateRT = function (log, callback) {
  var siteID = log.idsite,
    EventCategory = log.e_c,
    EventAction = log.e_a,
    doc = { $inc: {} };

  if (EventCategory && EventAction) {
    processWxShare(EventCategory, EventAction, doc);
  } else {
    processPV(log, doc);
    processRef(log, doc);
    uploadPV(siteID);
  }
  siteDao.update({ _id: siteID }, doc, callback);
};

// handle WeChat sharing
function processWxShare(EventCategory, EventAction, doc) {
  if (EventCategory === "flyer" && EventAction === "wxShare") {
    doc.$inc.wxShare = 1;
  }
}

// handle PV
function processPV(log, doc) {
  doc.$inc.pv = log.weight;
  doc.$inc._pv = 1;
}

// handle ref
function processRef(log, doc) {
  var refType = util.getRef(log);
  doc.$inc["ref." + refType] = log.weight;
  doc.$inc["_ref." + refType] = 1;
}

// upload pv to echuandan server
function uploadPV(siteID) {
  siteDao.findByID(siteID, function (err, site) {
    if (err) return;
    if (
      site &&
      site.updateTime &&
      site.flyerID &&
      util.diffMinutes(site.updateTime) > 10
    ) {
      // Update the latest upload time of PV
      siteDao.update(
        {
          _id: siteID,
        },
        {
          updateTime: new Date().getTime(),
        },
        function (err) {
          if (err) console.log(err);
        }
      );

      request.put(
        {
          url: config.HOST.ecd + "/api/flyers/" + site.flyerID + "/pv",
          form: {
            pv: site.pv,
          },
        },
        function (err, res, data) {
          if (err) console.log(err);
        }
      );
    }
  });
}
