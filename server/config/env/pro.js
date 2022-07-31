module.exports = {
  APP: {
    db: {
      name: "echuandan_analytics", //absolute name of database
      host: "10.10.104.41",
      port: 27017,
    },
  },
  LOGFILE: {
    maxSize: 500000, // 500k, about 800 lines (minimum data unit: bytes)
  },
  HOST: {
    ecd: "http://echuandan.com",
  },
};
