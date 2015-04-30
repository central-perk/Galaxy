var async 		= require('async'),
	request 	= require('request'),
	cache 		= require('memory-cache'),
	_ 			= require('lodash'),
	config      = context.config,
	util        = context.util,
	dirPath     = context.dirPath,
	filePath    = context.filePath,
	siteDao 	= util.getDao('site');
	siteModel 	= siteDao.siteModel;


// 创建
exports.create = function(req, res) {
	var flyerID = req.body.flyerID,
		siteID = util.randomStr();

	if (!flyerID) return res.error('缺少 flyerID');
	async.auto({
		// 检验 flyerID 唯一性
		checkFlyerID: function(cb) {
			siteDao.findOne({flyerID: flyerID}, cb);
		},
		// 检验 siteID 唯一性
		checkSiteID: function(cb) {
			siteDao.findOne({_id: siteID}, cb);
		}
	}, function(err, results) {
		if (results.checkFlyerID) { // 传单已经被创建则返回传单信息
			res.success(results.checkFlyerID);
		} else if (results.checkSiteID) {
			res.error('页面ID重复，创建失败');
		} else {
			siteDao.create({
				_id: siteID,
				flyerID: flyerID
			}, function(err, raw) {
				if (!err) {
					res.success(raw);
				} else {
					res.error('服务错误，创建失败');
				}
			});
		}
	});
};

// 获取单个
exports.getByID = function(req, res) {
	var siteID = req.params.siteID;
	if (!siteID) return res.error('缺少 siteID');
	siteDao.findByID(siteID, function(err, site) {
		if (!err) {
			res.success(site);
		} else {
			res.error('页面不存在或者发生错误');
		}
	});
};

// 获取 PV
exports.getPV = function(req, res) {
	var siteID = req.params.siteID;
	if (!siteID) return res.error('缺少 siteID');
	siteDao.getPVByID(siteID, function(err, site) {
		if (!err) {
			res.success(site.pv);
		} else {
			res.error('页面不存在或者发生错误');
		}
	});
};

// 获取 ref
exports.getRef = function(req, res) {
	var siteID = req.params.siteID;
	if (!siteID) return res.error('缺少 siteID');
	siteDao.getRefByID(siteID, function(err, site) {
		if (!err) {
			res.success(site.ref);
		} else {
			res.error('页面不存在或者发生错误');
		}
	});
};

// 获取 overview
exports.getOverview = function(req, res) {
	var siteID = req.params.siteID;
	if (!siteID) return res.error('缺少 siteID');
	siteDao.getOverviewByID(siteID, function(err, site) {
		if (!err) {
			res.success(site);
		} else {
			res.error('页面不存在或者发生错误');
		}
	});
};

exports.listPV = function(req, res) {

	if (req.query.flyerIDs) {
		var flyerIDs = req.query.flyerIDs.split(','),
			_allCachedIDs = cache.keys();
			allCachedIDs = [];

		_.forEach(_allCachedIDs, function(flyerID) {
			if (cache.get(flyerID)) {
				allCachedIDs.push(flyerID);
			}
		});

		var cachedIDs = _.intersection(flyerIDs, allCachedIDs),
			uncachedIDs = _.difference(flyerIDs, allCachedIDs);

		// 获取已经被缓存且需要返回的site
		var cachedSites = _.reduce(cachedIDs, function(before, after) {
			before.push(_.cloneDeep(cache.get(after))); // 引用对象可能被清空
			return before;
		}, []);

		siteDao.listPV({flyerID: {$in: uncachedIDs}}, function(err, uncachedSites) {
			if (!err) {

				// 将得到的数据缓存，并设置过期时间
				_.forEach(uncachedSites, function(site) {
					cache.put(site.flyerID, site, config.CACHE.expire.flyerID); // 5min
				});
				var allSites = _.merge(uncachedSites, cachedSites);
				res.pSuccess(allSites);
			} else {
				res.pSuccess([]);
			}
		});
	} else {
		res.pSuccess([]);
	}
};


exports.updateRT = function(log, callback) {
	var siteID = log.idsite,
		refType = util.getRef(log), // TODO 改进refType以支持来自邮件等等
		doc = {
			'$inc': {
				pv: log.weight,
				_pv: 1
			}
		};

	// 来源
	doc.$inc['ref.' + refType] = log.weight;
	doc.$inc['_ref.' + refType] = 1;

	// 上传传单PV
	uploadPV(siteID);

	siteDao.update({_id: siteID}, doc, callback);
};



function uploadPV(siteID) {
	siteDao.findByID(siteID, function(err, site) {
		if (err) return;
		if (site && site.updateTime && site.flyerID && util.diffMinutes(site.updateTime) > 10) {
			// 更新PV最新上传时间
			siteDao.update({
				_id: siteID
			}, {
				updateTime: (new Date()).getTime()
			}, function(err) {
				if (err) console.log(err);
			});

			request.put({
				url: config.HOST.ecd + '/api/flyers/' + site.flyerID + '/pv',
				form: {
					pv: site.pv
				}
			}, function(err, res, data){
				if (err) console.log(err);
			});
		}
	});
}






