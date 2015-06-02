module.exports = function(app, router, mw, site) {

	router.get('/site/pv', site.listPV);

	router.post('/site', site.create);
	router.get('/site/:siteID', site.getByID);
	router.get('/site/:siteID/pv', site.getPV);
	router.get('/site/:siteID/ref', site.getRef);
	router.get('/site/:siteID/overview', site.getOverview);

	// router.p ('/site/:siteID/overview', site.getOverview);
};