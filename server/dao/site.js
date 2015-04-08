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
	Model.findOne({_id: siteID}, '_id pv ref', function(err, doc) {
		return util.errHandler(err, doc, callback);
	});
};


// exports.listPV = function(query, callback) {
// 	Model.findOne({_id: siteID}, '_id pv ref', function(err, doc) {
// 		return util.errHandler(err, doc, callback);
// 	});
// };