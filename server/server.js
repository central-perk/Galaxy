// 环境变脸默认为dev
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var path    = require('path'),
	fs 		= require('fs-extra'),
	express = require('express');

// 注入全局上下文
require(path.join(__dirname, 'lib', 'util')).setContext(__dirname);

var config  = context.config,
	util    = context.util,
	dirPath = context.dirPath,
	filePath = context.filePath,
	kueCtrl = util.getCtrl('kue');

// 默认创建 log 文件夹，存在则不创建
fs.ensureDirSync(dirPath.log);

require(filePath.db).connect(function(mongoose) {

	var app = express();

	// Express配置
	require(filePath.express)(app, mongoose);

	// Route配置
	require(filePath.route)(app);

	// 处理日志任务队列
	kueCtrl.processLog();

	app.listen(app.get('port'), function() {
		console.log('Listen on port ' + app.get('port'));
	});
});