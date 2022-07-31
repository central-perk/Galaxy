var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  config = context.config,
  util = context.util;

//A line of logFile record, unanalyzed
var schema = new Schema({
  siteID: {
    //aID
    type: String,
    ref: "site",
  },
  r: Number,
  url: String,
  visitorID: String,
  ua: String,
  IP: String,
  sr: String, //resolution resolution
  ref: String,
  visitTS: {
    type: Date,
    get: util.dateTimeFormat,
    default: Date.now,
  },
  channel: String,
});

mongoose.model("origin", schema);
