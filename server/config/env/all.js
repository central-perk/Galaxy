module.exports = {
  APP: {
    name: "analytics",
    port: process.env.PORT || 8005,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: false,
      // maxAge: 10000 // 10s
      maxAge: 86400000, // 24h
      // maxAge: 2592000000 // 30day
    },
  },
  KUE: {
    maxProcess: 1, // The number of files processed by the queue at the same time
  },
  STORAGE: {
    // maxLines: 50 // The number of data lines for a storage operation
    maxLines: 50, // The number of data lines for a storage operation
  },
  LOGFILE: {
    status: {
      writeable: 10, //Writable
      unstorage: 20, //to be stored
      storaging: 30, //In storage
      storaged: 40, //In stock
    },
  },
  CACHE: {
    expire: {
      writeableLogFile: 300000, // 5min
      flyerID: 300000, // 5min
    },
  },
  PV: {
    //getWeight assign weight
    weight: [1, 1],
  },
  REF: {
    //The key in the ref under the site corresponds to the following data
    // from Weibo
    "weibo.com": "weibo",
    // direct interview
    "cdn.echuandan.com": "direct",
    "cdn-dev.echuandan.com": "direct",
    // from Easy Leaflet
    "www.echuandan.com": "echuandan",
    "echuandan.com": "echuandan",
    "m.echuandan.com": "echuandan",
    "dev.echuandan.com": "echuandan",
    "club.echuandan.com": "echuandan",
    "127.0.0.1:12000": "echuandan",
    "localhost:12000": "echuandan",
    // from search
    "baidu.com": "search",
    "www.baidu.com": "search",
    "google.com": "search",
    "www.google.com": "search",
  },
  UA: {
    device: {
      desktop: 10,
      mobile: 20,
      tablet: 30,
      proxy: 40,
    },
    os: {
      iOS: 10,
      Android: 20,
      "Windows Phone": 30,
      "Mac OS X": 40,
      Windows: 50,
      Linux: 60,
      other: 70,
    },
    browser: {
      Chrome: 10,
      Safari: 20,
      "Internet Explorer": 30,
      "Mobile Internet Explorer": 40,
      Opera: 50,
      "Opera Mobile": 60,
      Firefox: 70,
      "Firefox Mobile": 80,
      "UC Web": 90,
      other: 100,
    },
  },
  // setCustomVariable key etc:
  // _paq.push(['setCustomVariable', 2, 'firstPubTime', ECD.flyer.firstPubTime, 'page']);
  CVAR: {
    channel: "1",
    pubTime: "2",
  },
  TIME: {
    every10s: "*/10 * * * * *",
    every1m: "* */1 * * * *",
    every5m: "* */5 * * * *",
    every10m: "* */10 * * * *",
    every30m: "* */30 * * * *",
    every1h: "* * */1 * * *",
    every2h: "* * */2 * * *",
    every6h: "* * */6 * * *",
    midnight: "0 10 1 * * *",
    sunday: "0 0 0 * * 0",
  },
};
