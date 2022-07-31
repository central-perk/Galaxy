var path = require("path"),
  _ = require("lodash"),
  async = require("async"),
  fs = require("fs-extra"),
  cache = require("memory-cache"),
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  kueCtrl = util.getCtrl("kue"),
  logFileDao = util.getDao("logFile"),
  LOGFILE_STATUS = config.LOGFILE.status,
  LOGFILE_MAXSIZE = config.LOGFILE.maxSize,
  LOGFILE_CACHE_EXPIRE = config.CACHE.expire.writeableLogFile,
  logPath = dirPath.log;

// write to log file
exports.write = function (log, callback) {
  async.waterfall(
    [
      // Get the path to write to the log file
      function (cb) {
        writeableLogFilePath(cb);
      },
      // write to log file
      function (logFilePath, cb) {
        var logFileName = path.basename(logFilePath);
        log.fileName = logFileName;
        // http://www.jb51.net/article/29893.htm
        log = JSON.stringify(log, null, 0) + "\n";
        fs.writeFile(
          logFilePath,
          log,
          {
            encoding: "utf8",
            flag: "a",
          },
          cb
        );
      },
    ],
    callback
  );
};

// Get the path to write to the log file
function writeableLogFilePath(callback) {
  var logFileName, logFilePath;
  async.waterfall(
    [
      // Get writeable log file information in the database
      function (cb) {
        var logCache = cache.get("writeableLogFile");
        if (logCache) {
          cb(null, logCache);
        } else {
          logFileDao.findOne(
            { status: LOGFILE_STATUS.writeable },
            function (err, log) {
              if (!err && !_.isEmpty(log)) {
                cache.put("writeableLogFile", log, LOGFILE_CACHE_EXPIRE); // 5min
                cb(null, log);
              } else {
                cb(err || "writeableLogFile not fond");
              }
            }
          );
        }
      },
      // Check if the file exists
      function (log, cb) {
        logFileName = log.name;
        logFilePath = path.join(logPath, logFileName);
        if (fs.existsSync(logFilePath)) {
          cb(null, logFilePath);
        } else {
          logFileDao.remove({ name: logFileName }, function (err) {
            cb(err || "writeableLogFile not fond");
          });
        }
      },
      // Determine if the file size exceeds the limit
      function (logFilePath, cb) {
        try {
          var logFileSize = fs.statSync(logFilePath).size;
          if (LOGFILE_MAXSIZE > logFileSize) {
            cb(null, logFilePath);
          } else {
            // delete cache
            cache.del("writeableLogFile");
            // join the queue after updating the file status
            exports.updateStatus(
              logFileName,
              LOGFILE_STATUS.unstorage,
              function (err, raw) {
                if (!err) {
                  kueCtrl.enqueueStorage({
                    name: logFileName,
                    path: logFilePath,
                    status: LOGFILE_STATUS.unstorage,
                  });
                }
                cb(err || "logFile out of size");
              }
            );
          }
        } catch (e) {
          console.log(e);
          cb(e);
        }
      },
    ],
    function (err, result) {
      if (!err) {
        callback(null, logFilePath);
      } else {
        newLogFile(function (err, logFilePath) {
          callback(err, logFilePath);
        });
      }
    }
  );
}

// create new log file and return path
function newLogFile(callback) {
  var logFileName = util.lineTimeFormat() + util.randomStr() + ".log",
    logFilePath = path.join(logPath, logFileName);

  if (fs.existsSync(logFilePath)) {
    callback(null, logFilePath);
  } else {
    async.auto(
      {
        createFile: function (cb) {
          fs.createFile(logFilePath, cb);
        },
        createLogFile: function (cb) {
          logFileDao.create({ name: logFileName }, cb);
        },
      },
      function (err, results) {
        if (err) console.log(err);
        if (fs.existsSync(logFilePath)) {
          callback(null, logFilePath);
        } else {
          newLogFile(callback);
        }
      }
    );
  }
}

// update log file status
exports.updateStatus = function (name, status, callback) {
  logFileDao.update({ name: name }, { status: status }, callback);
};

// Get the log file (to be stored, in storage)
exports.getStoreLogFile = function (callback) {
  logFileDao.find(
    {
      status: {
        $in: [LOGFILE_STATUS.unstorage, LOGFILE_STATUS.storaging],
      },
    },
    callback
  );
};

// Clean up the log file and call it regularly
exports.clean = function () {
  logFileDao.find(
    {
      status: LOGFILE_STATUS.storaged,
    },
    function (err, logFiles) {
      _.forEach(logFiles, function (logFile) {
        var logFileName = logFile.name,
          logFilePath = path.join(logPath, logFile.name);
        logFileDao.remove({ name: logFileName }, function (err) {
          if (!err) {
            console.log(logFileName, "removed");
            fs.removeSync(logFilePath);
          }
        });
      });
    }
  );
};
