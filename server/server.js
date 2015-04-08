// 环境变脸默认为dev
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var path    = require('path'),
	express = require('express');

// 注入全局上下文
require(path.join(__dirname, 'lib', 'util')).setContext(__dirname);

var config  = context.config,
	util    = context.util,
	dirPath = context.dirPath,
	filePath = context.filePath;

require(filePath.db).connect(function(mongoose) {

	var app = express();

	// Express配置
	require(filePath.express)(app, mongoose);

	// Route配置
	require(filePath.route)(app);

	app.listen(app.get('port'), function() {
		console.log('Listen on port ' + app.get('port'));
	});
});