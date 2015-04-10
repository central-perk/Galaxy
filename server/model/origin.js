var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config  = context.config,
	util    = context.util;


var schema = new Schema({
    siteID: {
        type: String,
        ref: 'site'
    },
    r: Number,
    url: String,
    visitorID: String,
    ua: String,
    IP: String,
    sr: String,
    ref: String,
    visitTS: {
        type: Date,
		get: util.dateTimeFormat,
		default: Date.now
    },
    channel: String
});

mongoose.model('origin', schema);