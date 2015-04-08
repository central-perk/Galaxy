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
			name: 'analytics'
		}
	}
};