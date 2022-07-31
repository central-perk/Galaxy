var kue = require("kue"),
  jobs = kue.createQueue(),
  async = require("async"),
  config = context.config,
  util = context.util,
  siteCtrl = util.getCtrl("site"),
  logFileCtrl = util.getCtrl("logFile"),
  storageCtrl = util.getCtrl("storage");

// join the log task queue
exports.enqueueLog = function (log) {
  jobs
    .create("log", { log: log })
    .attempts(3)
    .removeOnComplete(true)
    .save(function (err) {
      if (err) {
        console.log(err);
        console.log(log.idsite);
      }
    });
};

// Join the inbound task queue
exports.enqueueStorage = function (logFile) {
  jobs
    .create("storage", { logFile: logFile })
    .attempts(3)
    .removeOnComplete(true)
    .save(function (err) {
      if (err) {
        console.log(err);
        console.log(log.idsite);
      }
    });
};

// Process the log task queue
exports.processLog = function () {
  jobs.process("log", config.KUE.maxProcess, function (job, done) {
    var log = job.data.log;
    async.waterfall(
      [
        function (cb) {
          // real-time information update
          siteCtrl.updateRT(log, cb);
        },
        function (result, cb) {
          // write to log file
          logFileCtrl.write(log, cb);
        },
      ],
      function (err, result) {
        if (err) console.log(err);
        done();
      }
    );
  });
};

// Process the inbound task queue
exports.processStorage = function () {
  jobs.process("storage", config.KUE.maxProcess, function (job, done) {
    var logFile = job.data.logFile;
    storageCtrl.store(logFile, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log(logFile.name, "Data storage successfully");
      }
      done();
    });
  });
};
