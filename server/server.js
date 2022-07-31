// The environment change face defaults to dev
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var path = require('path'),
fs = require('fs-extra'),
express = require('express');

// inject global context
require(path.join(__dirname, 'lib', 'util')).setContext(__dirname);

var config = context.config,
util = context.util,
dirPath = context.dirPath,
filePath = context.filePath,
kueCtrl = util.getCtrl('kue');

// The log folder is created by default, if it exists, it will not be created
fs.ensureDirSync(dirPath.log);

require(filePath.db).connect(function(mongoose) {

var app = express();

// Express configuration
require(filePath.express)(app, mongoose);

// Route configuration
require(filePath.route)(app);

// Process the log task queue
kueCtrl.processLog();

// Process the inbound task queue
kueCtrl.processStorage();

// start the scheduled task
require(filePath.cron);

app.listen(app.get('port'), function() {
console.log('Listen on port ' + app.get('port'));
});
});