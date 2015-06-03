var path 		= require('path'),
	url 		= require('url'),
	async 		= require('async'),
	_ 			= require('lodash'),
	lbs 		= require('node-qqwry'),
	useragent 	= require(context.filePath.useragent),
	logger 		= require(context.filePath.logger),
	config      = context.config,
	util        = context.util,
	eventDao 	= util.getDao('event'),
	CVAR 		= config.CVAR,
	DEVICE_TYPE = config.UA.device,
	OS_TYPE 	= config.UA.os,
	BROWSER_TYPE = config.UA.browser;



exports.list = function(req, res) {
	var query = req.query,
		siteID = query.siteID,
		category = query.category,
		action = query.action,
		st = util.getStartTime(query.st),
		et = util.getEndTime(query.et) || st,
		diffDays = util.diffDays(st, et, true);
		categories = getCategories(st, et, diffDays);
	var seriesData = {
		name: '转发数',
		data: []
	};
	var sum = 0;

	// 查询一天
	if (!diffDays) {
		eventDao.aggregate([{
			$match: {
				siteID: siteID,
				category: category,
				action: action,
				visitTS: {
					$gt: st,
					$lt: et
				}
			}
		}, {
			$project : {
				visitTS: {
					$add: ["$visitTS", 8*60*60*1000] // 消除时区问题
				}
			}
		}, {
			$group: {
				_id: {
					hour: {$hour: '$visitTS'}
				},
				count: {$sum: 1},
			}
		}, {
			$project : {
				hour: '$_id.hour',
				count: '$count',
			}
		}], function(err, data) {
			/**
			 * [ { _id: { hour: 13 }, count: 64, hour: 13 },
			 *   { _id: { hour: 11 }, count: 15, hour: 11 } ]
			 */

			_.forEach(categories, function(category) {
				var count = _.result(_.find(data, 'hour', category), 'count') || 0;
				seriesData.data.push(count);
				sum += count;
			});
			res.success({categories: categories, seriesData: seriesData, sum: sum});
		});
	} else {
		eventDao.aggregate([{
			$match: {
				siteID: siteID,
				category: category,
				action: action,
				visitTS: {
					$gt: st,
					$lt: et
				}
			}
		}, {
			$project : {
				visitTS: {
					$add: ["$visitTS", 8*60*60*1000] // 消除时区问题
				}
			}
		}, {
			$group: {
				_id: {
					year: {$year: '$visitTS'},
					month: {$month: '$visitTS'},
					day: {$dayOfMonth: '$visitTS'}
				},
				count: {$sum: 1},
			}
		}, {
			$project : {
				year: '$_id.year',
				month: '$_id.month',
				day: '$_id.day',
				count: '$count',
			}
		}], function(err, data) {
			_.forEach(categories, function(category) {
				var month = Number(category.split('-')[0]);
				var day = Number(category.split('-')[1]);
				var count = _.result(_.find(data, {'month': month, 'day': day}), 'count') || 0;
				seriesData.data.push(count);
				sum += count;
			});
			res.success({categories: categories, seriesData: seriesData, sum: sum});
		});
	}
};



function getCategories(st, et, diffDays) {
	if (diffDays) {
		return util.amongDays(st, et, 'M-D');
	} else {
		var _i, _results;
		return (function() {
		  	_results = [];
		  	for (_i = 0; _i <= 23; _i++){ _results.push(_i); }
		  	return _results;
		}).apply(this);
	}
}


// 创建
exports.create = function(logs, callback) {
	var _log = [];
	_.forEach(logs, function(log) {
		if (log.e_c) {
			_log.push(assembleLog(log));
		}
	});
	if (_log.length) {
		eventDao.create(_log, callback);
	} else {
		callback(null, null);
	}
};

function assembleLog(log) {
	var refType = util.getRef(log);
	var deviceType, osType, browserType, province, city;

	if (log.ua) {
		var ua = new useragent(log.ua);
		if (ua) {
			if (ua.devie && ua.devie.type) {
				deviceType = DEVICE_TYPE[ua.devie.type || 'desktop'];
			}
			if (ua.os && ua.os.name) {
				osType = OS_TYPE[ua.os.name || 'other'];
			}
			if (ua.browser && ua.browser.name) {
				browserType = BROWSER_TYPE[ua.browser.name || 'other'];
			}
		}
	}
	if (log.ip) {
		var location = lbs.getAddress(log.ip);
		if (location && location[0]) {
			var tmp = location[0].split('省');
			province = tmp[0] || '未知';
			city = (tmp[1] || tmp[0]).split('市')[0] || '未知';
			province.replace('市', '');
		}
	}
	var data = {
		siteID: log.idsite,
		category: log.e_c,
		action: log.e_a,
		visitorID: log.vid,
		ref: refType,
		visitTS: Number(log._viewts) || Number(new Date()),
		deviceType: deviceType,
		os: osType,
		browser: browserType,
		sr: log.res,
		IP: log.ip,
		country: '中国',
		province: province,
		city: city,
		weight: log.weight
	};
	return data;
}