var path    = require('path'),
	fs      = require('fs-extra'),
	_       = require('lodash'),
	moment  = require('moment');



// 注册上下文
exports.setContext = function(serverPath) {
	var self        = this,
		rootPath    = path.join(serverPath, '..'),
		configPath  = path.join(serverPath, 'config');

	global.context = {
		env: process.env.NODE_ENV,
		config: require(configPath),
		util: self,
		// 文件夹路径
		dirPath: {
			root: 	rootPath,
			server: serverPath,
			config: configPath,
			controller: path.join(serverPath, 'controller'),
			dao: 	path.join(serverPath, 'dao'),
			lib: 	path.join(serverPath, 'lib'),
			model: 	path.join(serverPath, 'model'),
			route: 	path.join(serverPath, 'route'),
			test: 	path.join(serverPath, 'test')
		},
		// 文件路径
		filePath: {}
	};


	// lib文件夹下子文件路径
	libPath = context.dirPath.lib;

	_.forEach(fs.readdirSync(libPath), function(fileName) {
		if (~fileName.indexOf('.js')) {
			fileName = fileName.replace('.js', '');
			context.filePath[fileName] = path.join(libPath, fileName);
		}
	});

	context.pkgJSON = require(path.join(rootPath, 'package.json'));

	// 注册model
	this.registerModels();

	// 注册dao
	this.registerDaos();
};

exports.registerModels = function() {
	_.forEach(fs.readdirSync(context.dirPath.model), function(fileName) {
		if (/\.js$/.test(fileName)) {
			var modelName = fileName.replace('.js', ''),
				modelPath = path.join(context.dirPath.model, fileName);
			require(modelPath);
		}
	});
};

exports.registerDaos = function() {
	require(context.dirPath.dao);
};

exports.getCtrl = function(ctrlName) {
	return require(path.join(context.dirPath.controller, ctrlName));
};

exports.getDao = function(daoName) {
	return require(context.dirPath.dao)[daoName];
};


// Format
exports.dateTimeFormat = function(date) {
	return getUTC(date).format("YYYY-MM-DD HH:mm");
};

exports.tsFormat = function(date) {
	return Number(moment(date).format("x"));
};

function getUTC(date) {
	return moment(date).utc().zone(-8);
}

exports.randomStr = function(length) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(''),
  		str = '';
	length = length || 8;
	for (var i = 0; i < length; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	return str;
};



exports.isPro = function() {
	return context.env === 'pro';
};

exports.isDev = function() {
	return context.env === 'dev';
};


exports.errHandler = function(err, doc, callback) {
	if (err) console.log(err);
	callback(err, doc);
};