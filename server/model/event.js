var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;


var schema = new Schema({
	siteID: {    //aID
		type: String,
		ref: 'site'
	},
	category: String, // 事件类型 ['flyer']
	action: String, // 事件动作 flyer.wxShare
	data: {}, // 事件数据 e_n,这个  _paq.push(['trackEvent', 'flyer', 'wxShare',JSON.stringify(data)]);
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
	sr: String, //分辨率 resolution
	IP: String,
	country: String,
	province: String,
	city: String
});

mongoose.model('event', schema);