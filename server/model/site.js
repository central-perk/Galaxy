var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  config = context.config,
  util = context.util;

var Number0 = {
  type: Number,
  default: 0,
};

/**
 * [site]
 */
var schema = new Schema({
  _id: {
    type: String,
    unique: true,
    sparse: true, // sparse index
  },
  flyerID: {
    // Artifact ID
    type: String,
    unique: true,
    sparse: true,
  },
  pv: Number0, //Report real-time update
  // source live update
  ref: {
    //report
    weibo: Number0,
    weixin: Number0,
    websites: Number0,
    direct: Number0,
    echuandan: Number0,
    search: Number0,
    email: Number0,
  },
  wxShare: Number0, // WeChat share times
  _pv: Number0, // real pv real-time update
  _ref: {
    // The real source is updated in real time
    weibo: Number0,
    weixin: Number0,
    websites: Number0,
    direct: Number0,
    echuandan: Number0,
    search: Number0,
    email: Number0,
  },
  updateTime: {
    // update time
    type: Date,
    get: util.dateTimeFormat,
    default: Date.now,
  },
});

mongoose.model("site", schema);
