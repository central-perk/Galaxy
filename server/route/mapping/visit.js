module.exports = function(app, router, mw, visit) {

	router.get('/visit/ref', visit.listRef);
	router.get('/visit/traffic', visit.listTraffic);

};