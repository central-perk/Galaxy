module.exports = {
	APP: {
		db: {
	        name: 'echuandan_analytics', //数据库绝对名称
	        host: '127.0.0.1',
			port: 27017
		}

	},
	LOGFILE: {
		maxSize: 500000 // 500k, 约 800行  （数据最小单位:字节）
	},
	HOST: {
		ecd: 'http://echuandan.com'
	}
};