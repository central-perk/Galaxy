var util  = context.util,
	Model = require('mongoose').model('site');



exports.getPVByID = function(siteID, callback) {
	Model.findOne({_id: siteID}, '_id pv', function(err, doc) {
		return util.errHandler(err, doc, callback);
	});
};

exports.getRefByID = function(siteID, callback) {
	Model.findOne({_id: siteID}, '_id ref', function(err, doc) {
		return util.errHandler(err, doc, callback);
	});
};

exports.getOverviewByID = function(siteID, callback) {
	Model.findOne({_id: siteID}, '_id pv ref wxShare', function(err, doc) {
		return util.errHandler(err, doc, callback);
	});
};

exports.listPV = function(query, callback) {
	Model.find(query, '_id pv flyerID', function(err, doc) {
		return util.errHandler(err, doc, callback);
	});
};