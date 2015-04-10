module.exports = function(app, router, mw, site) {

	router.get('/site/pv', site.listPV);

	router.post('/site', site.create);
	router.get('/site/:siteID', site.getByID);
	router.get('/site/:siteID/pv', site.getPV); // 路由有改动
	router.get('/site/:siteID/ref', site.getRef); // 路由有改动
	router.get('/site/:siteID/overview', site.getOverview); // 路由有改动

};