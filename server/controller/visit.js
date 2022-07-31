var path = require("path"),
  url = require("url"),
  async = require("async"),
  _ = require("lodash"),
  lbs = require("node-qqwry"),
  useragent = require(context.filePath.useragent),
  logger = require(context.filePath.logger),
  config = context.config,
  util = context.util,
  visitDao = util.getDao("visit"),
  CVAR = config.CVAR,
  DEVICE_TYPE = config.UA.device,
  OS_TYPE = config.UA.os,
  BROWSER_TYPE = config.UA.browser;

// flow chart
exports.listTraffic = function (req, res) {
  var startTime = new Date(); // for logging
  var query = req.query,
    siteID = query.siteID,
    st = util.getStartTime(query.st),
    et = util.getEndTime(query.et) || st,
    diffDays = util.diffDays(st, et, true);
  categories = getCategories(st, et, diffDays);

  var pvSeriesData = {
    name: "views",
    data: [],
  };
  var uvSeriesData = {
    name: "Number of visitors",
    data: [],
  };
  var sum = {
    pv: 0,
    uv: 0,
  };

  // query for a day
  if (!diffDays) {
    visitDao.aggregate(
      [
        {
          $match: {
            siteID: siteID,
            visitTS: {
              $gt: st,
              $lt: et,
            },
          },
        },
        {
          $project: {
            weight: {
              $ifNull: ["$weight", 1],
            },
            // visitorID: '$visitorID', // uv will be used
            visitTS: {
              $add: ["$visitTS", 8 * 60 * 60 * 1000], // Eliminate time zone issues
            },
          },
        },
        {
          $group: {
            _id: {
              hour: { $hour: "$visitTS" },
            },
            pv: { $sum: "$weight" },
            // uv: {$addToSet: '$visitorID'}, // Comment for now
          },
        },
        {
          $project: {
            hour: "$_id.hour",
            pv: "$pv",
            // uv: {$size: '$uv'}, // Comment for now
          },
        },
      ],
      function (err, data) {
        /**
         * [ { _id: { hour: 13 }, pv: 64, hour: 13 },
         * { _id: { hour: 11 }, pv: 15, hour: 11 } ]
         */

        _.forEach(categories, function (category) {
          var count = _.result(_.find(data, "hour", category), "pv") || 0;
          pvSeriesData.data.push(count);
          uvSeriesData.data.push(calcUV(count));
          sum.pv += count;
          sum.uv += calcUV(count);
        });
        var seriesData = [pvSeriesData, uvSeriesData];

        logger.info("call_interface", {
          time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
          interface_url: req.hostname + req.originalUrl,
        });

        res.success({
          categories: categories,
          seriesData: seriesData,
          sum: sum,
        });
      }
    );
  } else {
    visitDao.aggregate(
      [
        {
          $match: {
            siteID: siteID,
            visitTS: {
              $gt: st,
              $lt: et,
            },
          },
        },
        {
          $project: {
            weight: {
              $ifNull: ["$weight", 1],
            },
            visitorID: "$visitorID",
            visitTS: {
              $add: ["$visitTS", 8 * 60 * 60 * 1000], // Eliminate time zone issues
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$visitTS" },
              month: { $month: "$visitTS" },
              day: { $dayOfMonth: "$visitTS" },
            },
            pv: { $sum: "$weight" },
            uv: { $addToSet: "$visitorID" }, // Comment for now
          },
        },
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            pv: "$pv",
            // uv: {$size: '$uv'} // Comment for now
          },
        },
      ],
      function (err, data) {
        _.forEach(categories, function (category) {
          var month = Number(category.split("-")[0]);
          var day = Number(category.split("-")[1]);
          var count =
            _.result(_.find(data, { month: month, day: day }), "pv") || 0;
          pvSeriesData.data.push(count);
          uvSeriesData.data.push(calcUV(count));
          sum.pv += count;
          sum.uv += calcUV(count);
        });

        var seriesData = [pvSeriesData, uvSeriesData];

        logger.info("call_interface", {
          time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
          interface_url: req.hostname + req.originalUrl,
        });

        res.success({
          categories: categories,
          seriesData: seriesData,
          sum: sum,
        });
      }
    );
  }
};

// source line chart
exports.listRef = function (req, res) {
  var startTime = new Date();
  var query = req.query,
    siteID = query.siteID,
    st = util.getStartTime(query.st),
    et = util.getEndTime(query.et) || st,
    diffDays = util.diffDays(st, et, true);
  visitDao.aggregate(
    [
      {
        $match: {
          siteID: siteID,
          visitTS: {
            $gt: st,
            $lt: et,
          },
        },
      },
      {
        $project: {
          weight: {
            $ifNull: ["$weight", 1],
          },
          ref: "$ref",
          visitTS: {
            $add: ["$visitTS", 8 * 60 * 60 * 1000], // Eliminate time zone issues
          },
        },
      },
      {
        $group: {
          _id: {
            ref: "$ref",
          },
          count: { $sum: "$weight" },
        },
      },
    ],
    function (err, data) {
      var refs = [],
        seriesData = [],
        sum = 0;
      _.forEach(data, function (ref) {
        refs.push(ref._id.ref);
        sum += ref.count;
        seriesData.push([ref._id.ref, ref.count]);
      });
      logger.info("call_interface", {
        time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
        interface_url: req.hostname + req.originalUrl,
      });

      res.success({ refs: refs, seriesData: seriesData, sum: sum });
    }
  );
};
// Query by single day returns an array of hours, and query by multiple days returns an array of dates
function getCategories(st, et, diffDays) {
	if (diffDays) {
	  return util.amongDays(st, et, "M-D");
	} else {
	  var _i, _results;
	  return function () {
		_results = [];
		for (_i = 0; _i <= 23; _i++) {
		  _results.push(_i);
		}
		return _results;
	  }.apply(this);
	}
  }
  
  var uvList = [
	{
	  num: 30,
	  weight: 0.95,
	},
	{
	  num: 100,
	  weight: 0.9,
	},
	{
	  num: 200,
	  weight: 0.85,
	},
	{
	  num: 500,
	  weight: 0.8,
	},
	{
	  num: 1000,
	  weight: 0.75,
	},
	{
	  num: 1500,
	  weight: 0.8,
	},
	{
	  num: 2000,
	  weight: 0.85,
	},
	{
	  num: 4000,
	  weight: 0.9,
	},
	{
	  num: 7000,
	  weight: 0.95,
	},
	{
	  num: 10000,
	  weight: 0.9,
	},
	{
	  num: 13000,
	  weight: 0.85,
	},
	{
	  num: 17000,
	  weight: 0.8,
	},
	{
	  num: 20000,
	  weight: 0.75,
	},
	{
	  num: 25000,
	  weight: 0.8,
	},
	{
	  num: 30000,
	  weight: 0.85,
	},
	{
	  num: 50000,
	  weight: 0.9,
	},
	{
	  num: 100000,
	  weight: 0.8,
	},
  ];
  
  function calcUV(uv) {
	var sum = 0;
	for (var obj in uvList) {
	  if (uv < obj.num) {
		return Math.ceil(obj.weight * uv);
	  }
	}
	return Math.ceil(0.75 * uv);
  }
  
  // create
  exports.create = function (logs, callback) {
	var _log = [];
	_.forEach(logs, function (log) {
	  if (!log.e_c) {
		_log.push(assembleLog(log));
	  }
	});
  
	if (_log.length) {
	  visitDao.create(_log, callback);
	} else {
	  callback(null, null);
	}
  };
  
  // log assembly
  function assembleLog(log) {
	var refType = util.getRef(log);
	var deviceType, osType, browserType, province, city;
  
	if (log.ua) {
	  var ua = new useragent(log.ua);
	  if (ua) {
		if (ua.devi && ua.devi.type) {
		  deviceType = DEVICE_TYPE[ua.devie.type || "desktop"];
		}
		if (ua.os && ua.os.name) {
		  osType = OS_TYPE[ua.os.name || "other"];
		}
		if (ua.browser && ua.browser.name) {
		  browserType = BROWSER_TYPE[ua.browser.name || "other"];
		}
	  }
	}
	if (log.ip) {
	  var location = lbs.getAddress(log.ip);
	  if (location && location[0]) {
		var tmp = location[0].split("province");
		province = tmp[0] || "unknown";
		city ​​= (tmp[1] || tmp[0]).split("city")[0] || "unknown";
		province.replace("city", "");
	  }
	}
	var data = {
	  siteID: log.idsite,
	  visitorID: log.vid,
	  ref: refType,
	  visitTS: Number(log._viewts) || Number(new Date()),
	  deviceType: deviceType,
	  os: osType,
	  browser: browserType,
	  sr: log.res,
	  IP: log.ip,
	  country: "China",
	  province: province,
	  city: city,
	  weight: log.weight,
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