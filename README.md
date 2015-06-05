# 易传单统计服务器

###描述
- 收集作品运行时的统计数据
- 向易传单服务提供数据接口



### 启动项目

- 启动 mongoDB
- 启动 redis
- sudo npm install 
- gulp

### 本地测试

修改 echuandan.com服务下config/config-dev.js下

```
module.exports = {
	ANALYTICS: {
		host: 'http://127.0.0.1:8005/',
		_t: 'analytics',
		API: {
			CREATE_FLYER_AID: '/api/analytics/site'
		}
	}
};
```

### redis管理

使用 [kue](https://github.com/Automattic/kue) 管理redis中处理任务的队列