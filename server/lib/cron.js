var path 	= require('path'),
	fs 		= require('fs-extra'),
	cronJob = require('cron').CronJob,
	request = require('request'),
	async 	= require('async'),
	moment 	= require('moment'),
	config  = context.config,
	util    = context.util,
	filePath = context.filePath,
	dirPath = context.dirPath,
	CONFIG_DB = config.APP.db,
	storageCtrl = util.getCtrl('storage'),
	logFileCtrl = util.getCtrl('logFile'),
	siteCtrl = util.getCtrl('site'),
	dbBackup = require(filePath['db-backup']);


// 开启服务后10s执行
var d = moment().add(5, 'seconds'),
	hour = d.hours(),
	minute = d.minutes(),
	second = d.seconds(),
	after5s = second + ' ' + minute + ' ' + hour + ' * * *';


// 数据库定时备份
var jobDBBackup = new cronJob(config.TIME.midnight, function() {
	var dbBackupPath = path.join(dirPath.root, '..', 'analytics_backup', 'db');

	// 确保数据库备份文件夹存在
	fs.ensureDirSync(dbBackupPath);

	dbBackup.init({
		// 备份数据存储父级目录
		path: dbBackupPath,
		// 数据库连接
		host: CONFIG_DB.host + ':' + CONFIG_DB.port,
		// 数据库名称
		name: CONFIG_DB.name
	});
}, null, true, 'Asia/Shanghai');


// 日志文件定时清空
var jobCleanLogFile = new cronJob(config.TIME.sunday, function() {
	logFileCtrl.clean();
}, null, true, 'Asia/Shanghai');




// TIME = config.TIME
// BackupDB = require(path.join(process.g.rootPath, 'tools', 'db-backup', 'index.js'));


// # 开启服务后10s执行
// d = moment().add(10, 'seconds')
// hour = d.hours()
// minute = d.minutes()
// second = d.seconds()
// after10s = "#{second} #{minute} #{hour} * * *"

// # 定时入库
// if config.STORAGE.cron
// 	store = new CronJob(TIME[config.STORAGE.cron], ()->
// 		logFile.readyStorage((err)-> # 将当前现有的文件标记成可入库
// 			if !err
// 				storage.start()
// 			else
// 				console.log err
// 		)
// 	null, true, 'Asia/Shanghai')











// # 定时统计
// # if config.ARCHIVE.cron
// # 	archive = new CronJob(TIME[config.ARCHIVE.cron], ()->
// # 		console.log utils.getStartTS(new Date())
// # 		console.log utils.getEndTS(new Date())

// # 		console.log 'archive'
// # 	null, true, 'Asia/Shanghai')




// # archive有一些问题暂时停止服务
// # fDailyArchive = (delay, tryTime)->
// # 	date = moment().add('days', -1);
// # 	date0 = date.hour(0).minute(0).second(0).millisecond(1).clone()
// # 	date1 = date.hour(23).minute(59).second(59).millisecond(999).clone()

// # 	setTimeout(()->
// # 		async.waterfall([
// # 			# 前一天未入库的文件数量
// # 			(cb)->
// # 				logFile.count({
// # 					'$and':[
// # 						{status: {'$nin': [40]}},
// # 						{ts: {'$gte': date0, '$lte': date1}}
// # 					]
// # 				}, cb)
// # 			# 找到所有页面的siteID
// # 			(result, cb)->
// # 				if !result
// # 					site.listAll(cb)
// # 				else
// # 					if tryTime
// # 						tryTime -= 1
// # 						fDailyArchive(300000, tryTime)
// # 					cb('仍然存在未入库的文件')
// # 			# 创建存档
// # 			(aSite, cb)->
// # 				async.each(aSite, (oSite, callback)->
// # 					siteID = oSite.siteID
// # 					archive.creatDaily({siteID, date}, callback)
// # 				, cb)
// # 		], (err, result)->
// # 			if err
// # 				console.log err
// # 		)
// # 	, delay)


// # if config.ARCHIVE.daily
// # 	dailyArchive = new CronJob(config.ARCHIVE.daily, ()->
// # 	# dailyArchive = new CronJob("#{second} #{minute} #{hour} * * *", ()->
// # 		fDailyArchive(0, 10)
// # 	null, true, 'Asia/Shanghai')