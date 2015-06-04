var path 	= require('path'),
	fs 		= require('fs-extra'),
	cronJob = require('cron').CronJob,
	request = require('request'),
	async 	= require('async'),
	moment 	= require('moment'),
	config 	= context.config,
	util 	= context.util,
	filePath = context.filePath,
	dirPath = context.dirPath,
	CONFIG_DB 	= config.APP.db,
	storageCtrl = util.getCtrl('storage'),
	logFileCtrl = util.getCtrl('logFile'),
	siteCtrl	= util.getCtrl('site'),
	dbBackup 	= require(filePath['db-backup']);


// 开启服务后10s执行
var d = moment().add(5, 'seconds'),
	hour = d.hours(),
	minute = d.minutes(),
	second = d.seconds(),
	after5s = second + ' ' + minute + ' ' + hour + ' * * *';


// 数据库定时备份
var jobDBBackup = new cronJob(config.TIME.midnight, function () {
	var dbBackupPath;
	if (util.isPro()) {
		dbBackupPath = path.join(dirPath.root, '..', 'mnt', 'vdc', 'db_backup');
	} else {
		dbBackupPath = path.join(dirPath.root, '..', 'analytics_backup', 'db');
	}

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
var jobCleanLogFile = new cronJob(config.TIME.sunday, function () {
	logFileCtrl.clean();
}, null, true, 'Asia/Shanghai');