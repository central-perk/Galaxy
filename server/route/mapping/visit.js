module.exports = function(app, router, mw, visit) {

	// 来源查看（来源折线图）
	router.get('/visit/ref', visit.listRef);

	// 流量查看（流量折线图）
	router.get('/visit/traffic', visit.listTraffic);
};