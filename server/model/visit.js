var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;

// 索引
// http://docs.mongodb.org/manual/core/index-compound/
// {
// 	"siteID" : 1,
// 	"visitTS" : 1
// }

var schema = new Schema({
	siteID: {
		type: String,
		ref: 'site'
	},
	visitorID: String,
	ref: String,
	visitTS: {
		type: Date,
		get: util.dateTimeFormat,
		default: Date.now
	},
	deviceType: Number,
	os: Number,
	browser: Number,
	sr: String,
	IP: String,
	country: String,
	province: String,
	city: String,
	channel: String,
	weight: {
		type: Number,
		default: 1
	}
});

mongoose.model('visit', schema);