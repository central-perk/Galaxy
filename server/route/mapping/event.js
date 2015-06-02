module.exports = function(app, router, mw, event) {

	router.get('/event', event.list);

};