var path 		= require('path'),
	url 		= require('url'),
	async 		= require('async'),
	_ 			= require('lodash'),
	lbs 		= require('node-qqwry'),
	useragent 	= require(context.filePath.useragent),
	config      = context.config,
	util        = context.util,
	visitDao 	= util.getDao('visit'),
	CVAR 		= config.CVAR,
	DEVICE_TYPE = config.UA.device,
	OS_TYPE 	= config.UA.os,
	BROWSER_TYPE = config.UA.browser;

// logger = require(path.join(libsPath, 'logger', 'index.js'))



// listTraffic: (req, res)->
// 	startTime = new Date();

// 	query = req.query
// 	siteID = query.siteID
// 	st = utils.getStartTS(query.st)
// 	et = utils.getEndTS(query.et) or st
// 	diffDay = utils.diffDay(st, et, true)
// 	categories = getCategories(st, et, diffDay)
// 	# 查询一天
// 	if not diffDay
// 		visitDao.aggregate([{
// 			$match: {
// 				siteID
// 				visitTS: {
// 					$gt: st,
// 					$lt: et
// 				}
// 			}
// 		}, {
// 			$project : {
// 				weight: $ifNull: [ "$weight", 1]
// 				visitorID: '$visitorID'
// 				visitTS: $add: ["$visitTS", 8*60*60*1000] #消除时区问题
// 			}
// 		}, {
// 			$group: {
// 				_id: {
// 					hour: {$hour: '$visitTS'}
// 				}
// 				pv: {$sum: '$weight'}
// 				uv: {$addToSet: '$visitorID'}
// 			}
// 		}, {
// 			$project : {
// 				hour: '$_id.hour'
// 				pv: '$pv'
// 				uv: {$size: '$uv'}
// 			}
// 		}], (err, data)->
// 			tmp = {
// 				pv: {}
// 				uv: {}
// 			}
// 			pvSeriesData = {
// 				name: '浏览量'
// 				data: []
// 			}
// 			uvSeriesData = {
// 				name: '访客数'
// 				data: []
// 			}
// 			sum = {
// 				pv: 0,
// 				uv: 0
// 			}
// 			_.each(data, (record, index)->
// 				tmp.pv[record.hour] = record.pv
// 				tmp.uv[record.hour] = record.uv
// 				sum.pv += record.pv
// 				sum.uv += record.uv
// 			)
// 			# ADD
// 			sum.uv = Math.ceil(sum.pv * 0.9) || 1
// 			_.each(categories, (category)->
// 				count = tmp.pv?[category] or 0
// 				pvSeriesData.data.push(count)
// 				# ADD
// 				uvSeriesData.data.push(calcUV(count))
// 				# count = tmp.uv?[category] or 0
// 				# uvSeriesData.data.push(count)
// 			)
// 			seriesData = [pvSeriesData, uvSeriesData]

// 			logger.info('call_interface', {
// 				time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
// 				interface_url: req.host + req.originalUrl
// 			})

// 			res.success({categories, seriesData, sum})
// 		)
// 	else
// 		visitDao.aggregate([{
// 			$match: {
// 				siteID
// 				visitTS: {
// 					$gt: st,
// 					$lt: et
// 				}
// 			}
// 		}, {
// 			$project : {
// 				weight: $ifNull: [ "$weight", 1]
// 				visitorID: '$visitorID'
// 				visitTS: $add: ["$visitTS", 8*60*60*1000] #消除时区问题
// 			}
// 		}, {
// 			$group: {
// 				_id: {
// 					year:{$year: '$visitTS'},
// 					month:{$month: '$visitTS'},
// 					day:{$dayOfMonth: '$visitTS'}
// 				},
// 				pv: {$sum: '$weight'}
// 				uv: {$addToSet: '$visitorID'}
// 				# count: {$sum: 1}
// 			}
// 		}, {
// 			$project : {
// 				year: '$_id.year'
// 				month: '$_id.month'
// 				day: '$_id.day'
// 				pv: '$pv'
// 				uv: {$size: '$uv'}
// 			}
// 		}], (err, data)->
// 			tmp = {
// 				pv: {}
// 				uv: {}
// 			}
// 			pvSeriesData = {
// 				name: '浏览量'
// 				data: []
// 			}
// 			uvSeriesData = {
// 				name: '访客数'
// 				data: []
// 			}
// 			sum = {
// 				pv: 0,
// 				uv: 0
// 			}
// 			_.each(data, (record)->
// 				tmp.pv[[record.month, record.day].join('-')] = record.pv
// 				tmp.uv[[record.month, record.day].join('-')] = record.uv
// 				sum.pv += record.pv
// 				sum.uv += record.uv
// 			)
// 			# ADD
// 			sum.uv = Math.ceil(sum.pv * 0.9) || 1
// 			_.each(categories, (category)->
// 				count = tmp.pv?[category] or 0
// 				pvSeriesData.data.push(count)
// 				# ADD
// 				uvSeriesData.data.push(calcUV(count))
// 				# count = tmp.uv?[category] or 0
// 				# uvSeriesData.data.push(count)
// 			)
// 			seriesData = [pvSeriesData, uvSeriesData]

// 			logger.info('call_interface', {
// 				time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
// 				interface_url: req.host + req.originalUrl
// 			})

// 			res.success({categories, seriesData, sum})
// 		)
// listRef: (req, res)->
// 	startTime = new Date();

// 	query = req.query
// 	siteID = query.siteID
// 	st = utils.getStartTS(query.st)
// 	et = utils.getEndTS(query.et) or st
// 	diffDay = utils.diffDay(st, et, true)
// 	# 跨度小于一天的，按小时输出
// 	# 跨度大于一天的，按天输出
// 	visitDao.aggregate([{
// 		$match: {
// 			siteID,
// 			visitTS: {
// 				$gt: st,
// 				$lt: et
// 			}
// 		}
// 	}, {
// 		$project : {
// 			weight: $ifNull: [ "$weight", 1]
// 			ref: '$ref'
// 			visitTS: $add: ['$visitTS', 8*60*60*1000] #消除时区问题
// 		}
// 	}, {
// 		$group: {
// 			_id: {
// 				ref: '$ref'
// 			}
// 			count: {$sum: '$weight'}
// 		}
// 	}], (err, data)->
// 		refs = []
// 		seriesData = []
// 		sum = 0
// 		for i in data
// 			refs.push(i._id.ref)
// 			sum += i.count
// 			seriesData.push([i._id.ref, i.count])

// 		logger.info('call_interface', {
// 			time_spend: (new Date().getTime() - startTime.getTime()) / 1000,
// 			interface_url: req.host + req.originalUrl
// 		})
// 		res.success({refs, seriesData, sum})
// 	)





// 创建
exports.create = function(logs, callback) {
	var _log;
	if (_.isArray(logs)) {
		_log = [];
		_.forEach(logs, function(log) {
			_log.push(assembleLog(log));
		});
	} else {
		_log = assembleLog(logs);
	}
	visitDao.create(_log, callback);
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
	if (log.cvar && JSON.parse(log.cvar)[CVAR.channel] && JSON.parse(log.cvar)[CVAR.channel][1]) {
		data.channel = JSON.parse(log.cvar)[CVAR.channel][1];
	}
	return data;
}



