module.exports = function (app, router, mw, visit) {
  // Source view (source line chart)
  router.get("/visit/ref", visit.listRef);

  // Traffic view (traffic line chart)
  router.get("/visit/traffic", visit.listTraffic);
};
