module.exports = function(app, mw, site) {

	app.post('/site', site.create);

	// app.get('/site/:siteID', site.get);
	// app.get('/site/:siteID/pv', site.getPV) // 路由有改动
	// app.get('/site/:siteID/ref', site.getRef) // 路由有改动
	// app.get('/site/:siteID/overview', site.getOverview) // 路由有改动

	// app.get('/site/pv', site.listPV)

};