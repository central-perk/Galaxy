var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  config = context.config,
  util = context.util;

var schema = new Schema({
  siteID: {
    //aID
    type: String,
    ref: "site",
  },
  category: String, // event type ['flyer']
  action: String, // event action flyer.wxShare
  data: {}, // event data e_n, this _paq.push(['trackEvent', 'flyer', 'wxShare',JSON.stringify(data)]);
  visitorID: String,
  ref: String,
  visitTS: {
    type: Date,
    get: util.dateTimeFormat,
    default: Date.now,
  },
  deviceType: Number,
  os: Number,
  browser: Number,
  sr: String, //resolution resolution
  IP: String,
  country: String,
  province: String,
  city: String,
});

mongoose.model("event", schema);
