module.exports = function (app, router, mw, main) {
  // Gather statistics
  app.get("/collect", main.collect);
};
