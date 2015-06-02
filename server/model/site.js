var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;

var Number0 = {
	type: Number,
	default: 0
};


var schema = new Schema({
	_id: { // former siteID
		type: String,
		unique: true,
		sparse: true // 稀疏索引
	},
	flyerID: { // 传单 ID, former name
		type: String,
		unique: true,
		sparse: true
	},
	pv: Number0,
	// 来源
	ref: {
		weibo: Number0,
		weixin: Number0,
		websites: Number0,
		direct: Number0,
		echuandan: Number0,
		search: Number0,
		email: Number0
	},
	wxShare: Number0,
	_pv: Number0,
	_ref: {
		weibo: Number0,
		weixin: Number0,
		websites: Number0,
		direct: Number0,
		echuandan: Number0,
		search: Number0,
		email: Number0
	},
	updateTime: { // 更新时间, former ts
		type: Date,
		get: util.dateTimeFormat,
		default: Date.now
	}
});

mongoose.model('site', schema);
