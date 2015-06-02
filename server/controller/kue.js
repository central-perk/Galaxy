var kue 		= require('kue'),
	jobs 		= kue.createQueue(),
	async 		= require('async'),
	config      = context.config,
	util        = context.util,
	siteCtrl 	= util.getCtrl('site'),
	logFileCtrl = util.getCtrl('logFile'),
	storageCtrl = util.getCtrl('storage');


// 加入日志任务队列
exports.enqueueLog = function(log) {
	jobs.create('log', {log: log})
		.attempts(3)
		.removeOnComplete(true)
		.save(function(err) {
			if (err) {
				console.log(err);
				console.log(log.idsite);
			}
		});
};

// 加入入库任务队列
exports.enqueueStorage = function(logFile) {
	jobs.create('storage', {logFile: logFile})
		.attempts(3)
		.removeOnComplete(true)
		.save(function(err) {
			if (err) {
				console.log(err);
				console.log(log.idsite);
			}
		});
};

// 处理日志任务队列
exports.processLog = function() {
	jobs.process('log', config.KUE.maxProcess, function(job, done) {
		var log = job.data.log;
		async.waterfall([
			function(cb) { // 实时信息更新
				siteCtrl.updateRT(log, cb);
			},
			function(result, cb) { // 写入到日志文件
				logFileCtrl.write(log, cb);
			}
		], function(err, result) {
			if (err) console.log(err);
			done();
		});
	});
};

// 入库任务的处理
exports.processStorage = function() {
	jobs.process('storage', config.KUE.maxProcess, function(job, done) {
		var logFile = job.data.logFile;
		storageCtrl.store(logFile, function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log(logFile.name, '数据入库成功');
			}
			done();
		});
	});
};