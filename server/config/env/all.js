module.exports = {
	APP: {
		name: 'analytics',
		port: process.env.PORT || 8005,
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false,
			// maxAge: 10000 // 10s
			maxAge: 86400000 // 24h
			// maxAge: 2592000000 // 30day
		},
		db: {
			name: 'echuandan_analytics'
		}
	},
	STORAGE: {
		maxProcess: 1, // 队列同时处理的文件数量
		maxLines: 50 // 一次入库操作的数据行数
	},
	PV: {
		weight: [9, 15]
	},
	REF: {
		// 来自微博
		'weibo.com':                'weibo',
		// 直接访问
		'cdn.echuandan.com':        'direct',
		'cdn-dev.echuandan.com':    'direct',
		// 来自易传单
		'www.echuandan.com':        'echuandan',
		'echuandan.com':            'echuandan',
		'm.echuandan.com':       	'echuandan',
		'dev.echuandan.com':        'echuandan',
		'club.echuandan.com':       'echuandan',
		'127.0.0.1:12000':          'echuandan',
		'localhost:12000':          'echuandan',
		// 来自搜索
		'baidu.com':            	'search',
		'www.baidu.com':            'search',
		'google.com':           	'search',
		'www.google.com':           'search'
	},
	LOGFILE: {
		status: {
			writeable: 10, //可写入
			unstorage: 20, //待入库
			storaging: 30, //入库中
			storaged: 40 //已入库
		},
		maxSize: 500000
	},
	CACHE: {
		expire: {
			writeableLogFile: 300000 // 5min
		}
	}
};