var path 		= require('path'),
	_ 			= require('lodash'),
	async 		= require('async'),
	fs 			= require('fs-extra'),
	cache 		= require('memory-cache'),
	config      = context.config,
	util        = context.util,
	dirPath 	= context.dirPath,
	kueCtrl 	= util.getCtrl('kue'),
	logFileDao	= util.getDao('logFile'),
	LOGFILE_STATUS = config.LOGFILE.status,
	LOGFILE_MAXSIZE = config.LOGFILE.maxSize,
	LOGFILE_CACHE_EXPIRE = config.CACHE.expire.writeableLogFile,
	logPath 	= dirPath.log;


exports.write = function(log, callback) {
	async.waterfall([
		// 获得可写入日志文件的路径
		function(cb) {
			writeableLogFilePath(cb);
		},
		// 写入日志文件
		function(logFilePath, cb) {
			var logFileName = path.basename(logFilePath);
			log.fileName = logFileName;
			log = JSON.stringify(log, null, 0) + '\n';
			fs.writeFile(logFilePath, log, {
				encoding: 'utf8',
				flag:'a'
			}, cb);
		}
	], callback);
};

// 获得可写入日志文件的路径
function writeableLogFilePath(callback) {
	var logFileName, logFilePath;
	async.waterfall([
		// 获得数据库中可写入日志文件信息
		function(cb) {
			if (cache.get('writeableLogFile')) {
				cb(null, cache.get('writeableLogFile'));
			} else {
				logFileDao.findOne({status: LOGFILE_STATUS.writeable}, function(err, log) {
					if (!err && !_.isEmpty(log)) {
						cache.put('writeableLogFile', log, LOGFILE_CACHE_EXPIRE); // 5min
						cb(null, log);
					} else {
						cb(err || 'writeableLogFile not fond');
					}
				});
			}
		},
		// 判断文件是否存在
		function(log, cb) {
			logFileName = log.name;
			logFilePath = path.join(logPath, logFileName);
			if(fs.existsSync(logFilePath)) {
				cb(null, logFilePath);
			} else {
				logFileDao.remove({name: logFileName}, function(err) {
					cb(err || 'writeableLogFile not fond');
				});
			}
		},
		// 判断文件大小是否超出限制
		function(logFilePath, cb) {
			try {
				var logFileSize = fs.statSync(logFilePath).size;
				if (LOGFILE_MAXSIZE > logFileSize) {
					cb(null, logFilePath);
				} else {
					logFileDao.update({name: logFileName}, {status: LOGFILE_STATUS.unstorage}, function(err, raw) {
						if (!err) {
							kueCtrl.enqueueStorage({
								name: logFileName,
								status: LOGFILE_STATUS.unstorage
							});
						}
						cb(err || 'logFile out of size');
					});
				}
			} catch (e) {
				console.log(e);
				cb(e);
			}
		}
	], function(err, result) {
		if (!err) {
			callback(null, logFilePath);
		} else {
			newLogFile(function(err, logFilePath) {
				callback(err, logFilePath);
			});
		}
	});
}

// 创建新的日志文件并返回路径
function newLogFile(callback) {
	var logFileName = util.lineTimeFormat() + '.log',
		logFilePath = path.join(logPath, logFileName);

	if (fs.existsSync(logFilePath)) {
		callback(null, logFilePath);
	} else {
		async.auto({
			createFile: function(cb) {
				fs.createFile(logFilePath, cb);
			},
			createLogFile: function(cb) {
				logFileDao.create({name: logFileName}, cb);
			}
		}, function(err, results) {
			if (err) console.log(err);
			if (fs.existsSync(logFilePath)) {
				callback(null, logFilePath);
			} else {
				newLogFile(callback);
			}
		});
	}
}


// module.exports =
// 	count: (query, callback)->
// 		logFileDao.count(query, callback)
// 	readyStorage: (callback)->
// 		# 将日志文件状态从可写入转为待入库状态
// 		logFileDao.Model.update(
// 			{status: LOGFILE_STATUS.writeable},
// 			{status: LOGFILE_STATUS.unstorage},
// 			{multi: true},
// 			callback
// 		)