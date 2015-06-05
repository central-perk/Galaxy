var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;

//logFile 的一行记录，未分析过的
var schema = new Schema({
	siteID: { //aID
		type: String,
		ref: 'site'
	},
	r: Number,
	url: String,
	visitorID: String,
	ua: String,
	IP: String,
	sr: String, //分辨率 resolution
	ref: String,
	visitTS: {
		type: Date,
		get: util.dateTimeFormat,
		default: Date.now
	},
	channel: String
});

mongoose.model('origin', schema);