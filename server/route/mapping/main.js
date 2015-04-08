module.exports = function(app, router, mw, main) {


	// 收集统计数据
	app.get('/collect', main.collect);



	// 统计数据接口
	// app.get('/visit/all/:siteID', index.allVisit);

};