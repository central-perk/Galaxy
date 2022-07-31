var path = require("path"),
  fs = require("fs-extra"),
  cronJob = require("cron").CronJob,
  request = require("request"),
  async = require("async"),
  moment = require("moment"),
  config = context.config,
  util = context.util,
  filePath = context.filePath,
  dirPath = context.dirPath,
  CONFIG_DB = config.APP.db,
  storageCtrl = util.getCtrl("storage"),
  logFileCtrl = util.getCtrl("logFile"),
  siteCtrl = util.getCtrl("site"),
  dbBackup = require(filePath["db-backup"]);

// Execute 10s after starting the service
var d = moment().add(5, "seconds"),
  hour = d.hours(),
  minute = d.minutes(),
  second = d.seconds(),
  after5s = second + " " + minute + " " + hour + " * * *";

// // Database scheduled backup
// var jobDBBackup = new cronJob(config.TIME.midnight, function () {
// var dbBackupPath;
// if (util.isPro()) {
// dbBackupPath = path.join(dirPath.root, '..', 'mnt', 'vdc', 'db_backup');
// } else {
// dbBackupPath = path.join(dirPath.root, '..', 'analytics_backup', 'db');
// }

// // Make sure the database backup folder exists
// fs.ensureDirSync(dbBackupPath);

// dbBackup.init({
// // Backup datastore parent directory
// path: dbBackupPath,
// 		// Database linkage
// host: CONFIG_DB.host + ':' + CONFIG_DB.port,
// 		// Name database
// name: CONFIG_DB.name
// });
// }, null, true, 'Asia/Shanghai');

// The log file is periodically cleared
var jobCleanLogFile = new cronJob(
  config.TIME.sunday,
  function () {
    logFileCtrl.clean();
  },
  null,
  true,
  "Asia/Shanghai"
);
