module.exports = function (app, router, mw, event) {
  // Get event information (WeChat sharing line chart)
  router.get("/event", event.list);
};
