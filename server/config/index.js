var path = require('path'),
	fs = require('fs-extra'),
	_ = require('lodash'),
	CONFIG = {},
	CONFIG_ALL = require(path.join(__dirname, 'env', 'all')),
	CONFIG_ENV = require(path.join(__dirname, 'env', process.env.NODE_ENV)) || {};


CONFIG = _.merge(CONFIG, CONFIG_ALL);
CONFIG = _.merge(CONFIG, CONFIG_ENV);


_.forEach(fs.readdirSync(__dirname), function(fileName) {
	if (/\.js$/.test(fileName) && fileName !== 'index.js') {
		CONFIG = _.merge(CONFIG, require(path.join(__dirname, fileName)));
	}
});


module.exports = CONFIG;