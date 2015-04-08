var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config  = context.config,
    util    = context.util,
    LOGFILE_STATUS = config.LOGFILE.status;


var schema = new Schema({
    name: String, // 日志文件名
    status: { // 日志文件状态
        type: Number,
        default: LOGFILE_STATUS.writeable
    },
    createTime: { // 创建时间, former ts
        type: Date,
        get: util.dateTimeFormat,
        default: Date.now
    }
});

mongoose.model('logFile', schema);