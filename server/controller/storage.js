var path = require("path"),
  _ = require("lodash"),
  async = require("async"),
  fs = require("fs-extra"),
  lineReader = require("line-reader"),
  config = context.config,
  util = context.util,
  dirPath = context.dirPath,
  logPath = dirPath.log,
  logFileDao = util.getDao("logFile"),
  originDao = util.getDao("origin"),
  kueCtrl = util.getCtrl("kue"),
  logFileCtrl = util.getCtrl("logFile"),
  visitCtrl = util.getCtrl("visit"),
  originCtrl = util.getCtrl("origin"),
  eventCtrl = util.getCtrl("event"),
  LOGFILE_STATUS = config.LOGFILE.status,
  STORAGE_MAXLINES = config.STORAGE.maxLines;

// log file storage
exports.store = function (logFile, callback) {
  var logFileName = logFile.name,
    logFilePath = logFile.path || path.join(logPath, logFileName),
    logFileStatus = logFile.status;

  if (!logFileName || !logFilePath || !logFileStatus) {
    console.log("Log file information is missing");
    callback(null, null);
  }

  async.waterfall(
    [
      // Make sure the log file exists
      function (cb) {
        fs.exists(logFilePath, function (exists) {
          if (exists) {
            cb(null, null);
          } else {
            console.log("file not exists");
            cb("file not exists");
          }
        });
      },
      // Determine the number of lines in the log file that have been stored
      function (result, cb) {
        if (logFileStatus === LOGFILE_STATUS.unstorage) {
          // To be stored
          cb(null, 0);
        } else if (logFileStatus === LOGFILE_STATUS.storaging) {
          // in storage
          // The number of entries for visit and origin may be different?
          originDao.count({ fileName: logFileName }, cb);
        } else if (logFileStatus === LOGFILE_STATUS.storaged) {
          // stored
          console.log("file" + logFileName + "stored");
          cb("The file has been stored");
        } else if (logFileStatus === LOGFILE_STATUS.writeable) {
          // writeable
          console.log("File" + logFileName + "Writable");
          cb(null, 0);
        }
      },
      // Put the log file status into storage, and pass the number of rows that have been stored
      function (lineNum, cb) {
        logFileCtrl.updateStatus(
          logFileName,
          LOGFILE_STATUS.storaging,
          function (err, raw) {
            cb(err, lineNum);
          }
        );
      },
      // Log files are stored in chunks
      function (lineNum, cb) {
        var lineCur = 0,
          logBlock = [];

        // Documentation https://github.com/nickewing/line-reader
        lineReader.eachLine(logFilePath, function (line, last, lineCallback) {
          lineCur++;
          if (line && lineCur > lineNum) {
            // line represents a log
            // TODO data may be incomplete, resulting in JSON.parse error
            line = JSON.parse(line);
            if (line.level) delete line.level;
            if (line.message) delete line.message;
            logBlock.push(line);

            if (logBlock.length >= STORAGE_MAXLINES || last) {
              // put in
              json2db(logBlock, function (err) {
                // clear the log block
                logBlock = [];
                if (last) {
                  lineCallback(false);
                  return cb(null, null);
                } else {
                  lineCallback();
                }
              });
            } else {
              lineCallback();
            }
          } else if (last) {
            lineCallback(false);
            return cb(null, null);
          } else {
            lineCallback();
          }
        });
      },
    ],
    function (err, result) {
      // Set the log file status to stored
      if (!err) {
        logFileCtrl.updateStatus(
          logFileName,
          LOGFILE_STATUS.storaged,
          callback
        );
      } else {
        callback(null, null);
      }
    }
  );
};

// json file storage
function json2db(logs, callback) {
  async.auto(
    {
      storeVisit: function (cb) {
        visitCtrl.create(logs, cb);
      },
      storeEvent: function (cb) {
        eventCtrl.create(logs, cb);
      },
      origin: function (cb) {
        originCtrl.create(logs, cb);
      },
    },
    callback
  );
}

// automatic storage
exports.autoStore = function () {
  logFileCtrl.getStoreLogFile(function (err, logFiles) {
    _.forEach(logFiles, function (logFile) {
      kueCtrl.enqueueStorage(oLogFile);
    });
  });
};
