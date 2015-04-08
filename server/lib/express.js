var path            = require('path'),
	express         = require('express'),
	router 			= express.Router(),
	compression     = require('compression'),
	cookieParser    = require('cookie-parser'),
	bodyParser      = require('body-parser'),
	methodOverride  = require('method-override'),
	favicon         = require('serve-favicon'),
	errorHandler    = require('errorhandler'),
	logger          = require('morgan'),
	multer          = require('multer');


var env         = context.env,
	config      = context.config,
	util        = context.util,
	dirPath     = context.dirPath,
	filePath    = context.filePath,
	CONFIG_APP  = config.APP;

module.exports = function(app, passport, mongoose) {
	// 开发环境
	if (app.get('env') === 'dev') {
		app.use(errorHandler());
		app.use(logger('dev')); // 纪录每一个请求
	}
	// 生产环境
	// if (app.get('env') === 'pro') {
	// 	return;
	// }

	// res的中间件
	app.use(function(req, res, next) {
		res.success = function(data) {
			res.json(data);
		};
		res.successMsg = function(data) {
			res.json({msg: data});
		};
		res.errorMsg = function(data) {
			res.status(500).json({msg: data});
		};
		next();
	});


	app.set('port', CONFIG_APP.port);

	app.enable('jsonp callback');

	// compress requests and responses
	app.use(compression()); // 需要进一步设置
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// 所有路由均以 /api/analytics 开头
	app.use('/api/analytics', router);

	// Node.js middleware for handling `multipart/form-data`.
	app.use(multer());
};
