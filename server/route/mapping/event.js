module.exports = function(app, router, mw, event) {

	// 获取事件信息（微信分享折线图）
	router.get('/event', event.list);

};