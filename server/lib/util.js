var path    = require('path'),
	fs      = require('fs-extra'),
	_       = require('lodash'),
	moment  = require('moment'),
	url 	= require('url');

require(path.join(__dirname, 'moment-recur'));

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
			log: 	path.join(rootPath, 'log'),
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

// 时间戳
exports.tsFormat = function(date) {
	return Number(moment(date).format("x"));
};

// 年月日时分秒
exports.lineTimeFormat = function(date) {
	return getUTC(date).format("YYYYMMDDHHmmss");
};

// 相差的分钟数
exports.diffMinutes = function(date1, date2) {
	date1 = moment(date1);
	date2 = date2 || moment();
	return Math.floor(Math.abs(date1.diff(date2, 'minutse')) / 60000);
};

// 相差的天数
exports.diffDays = function(date1, date2, isTs) {
	if (isTs) {
		date1 = this.getStartTime(date1);
		date2 = this.getEndTime(date2);
	}
	date1 = moment(Number(date1));
	date2 = moment(Number(date2));
	return Math.abs(date2.diff(date1, 'days'));
};

// 间隔的日期
exports.amongDays = function(date1, date2, format) {
	if(Number(date1) > Number(date2)) {
		var tmp = date1;
		date1 = date2;
		date2 = tmp;
	}
	format = format || 'MM-DD';
	return moment().recur(Number(date1), Number(date2)).every(1).days().all(format);
};

// 获取一天开始的时间
exports.getStartTime = function(date) {
	date = Number(date) || (new Date()).getTime();
	return moment(date).startOf('day').clone().toDate();
};

// 获取一天结束的时间
exports.getEndTime = function(date) {
	date = Number(date) || (new Date()).getTime();
	return moment(date).endOf('day').clone().toDate();
};

function getUTC(date) {
	return moment(date).utcOffset(8);
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




exports.getRef = function(log) {
	if (log.ua) {
		var reg = log.ua.toLowerCase().match(/MicroMessenger/i);
		if (reg && reg.length && reg[0] === 'micromessenger') {
			return 'weixin';
		}
	}

	var host = '',
		refUrl = log.urlref;
		CONFIG_REF = context.config.REF;
	if (refUrl) host = url.parse(refUrl).host;
	return host && CONFIG_REF[host] ? CONFIG_REF[host] : 'websites';
};

