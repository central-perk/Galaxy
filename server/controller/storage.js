var path 		= require('path'),
	_ 			= require('lodash'),
	async 		= require('async'),
	fs 			= require('fs-extra'),
	lineReader 	= require('line-reader'),
	config      = context.config,
	util        = context.util,
	dirPath 	= context.dirPath,
	logPath 	= dirPath.log,
	logFileDao 	= util.getDao('logFile'),
	originDao 	= util.getDao('origin'),
	kueCtrl 	= util.getCtrl('kue'),
	logFileCtrl = util.getCtrl('logFile'),
	visitCtrl 	= util.getCtrl('visit'),
	originCtrl 	= util.getCtrl('origin'),
	eventCtrl 	= util.getCtrl('event'),
	LOGFILE_STATUS = config.LOGFILE.status,
	STORAGE_MAXLINES = config.STORAGE.maxLines;

// 日志文件入库
exports.store = function(logFile, callback) {
	var logFileName = logFile.name,
		logFilePath = logFile.path || path.join(logPath, logFileName),
		logFileStatus = logFile.status;

	if(!logFileName || !logFilePath || !logFileStatus) {
		console.log('日志文件信息缺少');
		callback(null, null);
	}

	async.waterfall([
		// 确定日志文件存在
		function(cb) {
			fs.exists(logFilePath, function (exists) {
				if (exists) {
					cb(null, null);
				} else {
					console.log('file not exists');
					cb('file not exists');
				}
			});
		},
		// 确定日志文件已经入库行数
		function(result, cb) {
			if (logFileStatus === LOGFILE_STATUS.unstorage) { // 待入库
				cb(null, 0);
			} else if (logFileStatus === LOGFILE_STATUS.storaging) { // 入库中
				// visit 和 origin 入的条数可能不同？
				originDao.count({fileName: logFileName}, cb);
			} else if (logFileStatus === LOGFILE_STATUS.storaged){ // 已入库
				console.log('文件 ' + logFileName + ' 已入库');
				cb('文件已入库');
			} else if (logFileStatus === LOGFILE_STATUS.writeable) { // 可写入
				console.log('文件 ' + logFileName + ' 可写入');
				cb(null, 0);
			}
		},
		// 将日志文件状态置成入库中，并传递已经入库行数
		function(lineNum, cb) {
			logFileCtrl.updateStatus(logFileName, LOGFILE_STATUS.storaging, function(err, raw) {
				cb(err, lineNum);
			});
		},
		// 日志文件分块入库
		function(lineNum, cb) {
			var lineCur = 0,
				logBlock = [];

			// 文档 https://github.com/nickewing/line-reader
			lineReader.eachLine(logFilePath, function(line, last, lineCallback) {
				lineCur++;
				if (line && lineCur > lineNum) {
					// line 表示一条日志
					// TODO 数据可能不完整，导致 JSON.parse 报错
					line = JSON.parse(line);
					if (line.level) delete line.level;
					if (line.message) delete line.message;
					logBlock.push(line);

					if (logBlock.length >= STORAGE_MAXLINES || last) {
						// 入库
						json2db(logBlock, function(err) {
							// 日志块清空
							logBlock = [];
							if (last) {
								lineCallback(false);
								return cb(null, null);
							} else {
								lineCallback();
							}
						});
					} else {
						lineCallback();
					}
				} else if (last) {
					lineCallback(false);
					return cb(null, null);
				} else {
					lineCallback();
				}
			});
		}
	], function(err, result) {
		// 将日志文件状态置成已入库
		if (!err) {
			logFileCtrl.updateStatus(logFileName, LOGFILE_STATUS.storaged, callback);
		} else {
			callback(null, null);
		}
	});
};

// json 文件入库
function json2db(logs, callback) {
	async.auto({
		storeVisit: function(cb) {
			visitCtrl.create(logs, cb);
		},
		storeEvent: function(cb) {
			console.log('storeEvent');
			eventCtrl.create(logs, cb);
		},
		origin: function(cb) {
			originCtrl.create(logs, cb);
		}
	}, callback);
}

// 自动入库
exports.autoStore = function() {
	logFileCtrl.getStoreLogFile(function(err, logFiles) {
		_.forEach(logFiles, function(logFile) {
			kueCtrl.enqueueStorage(oLogFile);
		});
	});
};