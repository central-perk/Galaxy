var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;

var Number0 = {
	type: Number,
	default: 0
};

/**
 * [site ]
 */
var schema = new Schema({
	_id: {
		type: String,
		unique: true,
		sparse: true // 稀疏索引
	},
	flyerID: { // 作品 ID
		type: String,
		unique: true,
		sparse: true
	},
	pv: Number0,//报表 实时更新
	// 来源   实时更新
	ref: { //报表
		weibo: Number0,
		weixin: Number0,
		websites: Number0,
		direct: Number0,
		echuandan: Number0,
		search: Number0,
		email: Number0
	},
	wxShare: Number0, // 微信分享次数
	_pv: Number0, // 真实 pv  实时更新
	_ref: { // 真实 来源       实时更新
		weibo: Number0,
		weixin: Number0,
		websites: Number0,
		direct: Number0,
		echuandan: Number0,
		search: Number0,
		email: Number0
	},
	updateTime: { // 更新时间
		type: Date,
		get: util.dateTimeFormat,
		default: Date.now
	}
});

mongoose.model('site', schema);
