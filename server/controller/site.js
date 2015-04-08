var async 		= require('async'),
	request 	= require('request'),
	cache 		= require('memory-cache'),
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
	// if req.query.flyerIDs
	// 	flyerIDs = req.query.flyerIDs.split(',')
	// 	allCachedIDs = cache.keys()
	// 	cachedIDs = _.intersection(flyerIDs, allCachedIDs)
	// 	uncachedIDs = _.difference(flyerIDs, allCachedIDs)

	// 	# 获取已经被缓存且需要返回的site
	// 	cachedSites = _.reduce cachedIDs, (before, after)->
	// 		before.push(cache.get(after))
	// 		return before
	// 	, []

	// 	query = { name: {$in: uncachedIDs}}
	// else
	// 	query = {}
	// siteDao.listPV(query, (err, uncachedSites)->
	// 	if !err and uncachedSites

	// 		# 将得到的数据缓存，并设置过期时间
	// 		_.forEach uncachedSites, (site)->
	// 			cache.put(site.name, site, config.CACHE.expire) # 5min
	// 		aSites = _.merge(uncachedSites, cachedSites)

	// 		res.pSuccess(aSites)
	// 	else
	// 		res.error('页面不存在或者发生错误')
	// )
};







