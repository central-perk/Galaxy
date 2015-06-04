module.exports = function(app, router, mw, site) {

	// 获取多个页面 PV，在后台被用到
	router.get('/site/pv', site.listPV);

	// 创建被统计页面
	router.post('/site', site.create);

	// 获取单个页面信息
	router.get('/site/:siteID', site.getByID);

	// 获取单个页面 PV
	router.get('/site/:siteID/pv', site.getPV);

	// 获取单个页面来源
	router.get('/site/:siteID/ref', site.getRef);

	// 获取单个页面概况
	router.get('/site/:siteID/overview', site.getOverview);
};