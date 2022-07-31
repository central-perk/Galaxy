module.exports = function (app, router, mw, site) {
  // Get multiple page PVs, which are used in the background
  router.get("/site/pv", site.listPV);

  // Create the counted page
  router.post("/site", site.create);

  // Get information about a single page
  router.get("/site/:siteID", site.getByID);

  // Get a single page PV
  router.get("/site/:siteID/pv", site.getPV);

  // Get a single page source
  router.get("/site/:siteID/ref", site.getRef);

  // Get an overview of a single page
  router.get("/site/:siteID/overview", site.getOverview);
};
