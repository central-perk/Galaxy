var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  config = context.config,
  util = context.util,
  LOGFILE_STATUS = config.LOGFILE.status;

var schema = new Schema({
  name: String, // log file name
  status: {
    // log file status
    type: Number,
    default: LOGFILE_STATUS.writeable,
  },
  createTime: {
    // creation time, former ts
    type: Date,
    get: util.dateTimeFormat,
    default: Date.now,
  },
});

mongoose.model("logFile", schema);
