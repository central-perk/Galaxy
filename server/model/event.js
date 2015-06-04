var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;


var schema = new Schema({
	siteID: {
		type: String,
		ref: 'site'
	},
	category: String, // 事件类型
	action: String, // 事件动作
	data: {}, // 事件数据
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
	city: String
});

mongoose.model('event', schema);