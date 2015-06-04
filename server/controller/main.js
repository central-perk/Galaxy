var _ 			= require('lodash'),
	config      = context.config,
	util        = context.util,
	dirPath     = context.dirPath,
	filePath    = context.filePath,
	kue 		= util.getCtrl('kue'),
	CONFIG_PV_WEIGHT = config.PV.weight;


// 收集数据
exports.collect = function(req, res) {
	var log = req.query;

	log.ua = req.headers['user-agent'];
	log.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	// 添加 pv 权重
	log.weight = getWeight(log);

	// 加入日志任务队列
	kue.enqueueLog(log);

	// 收集统计结果，直接返回图片类型
	res.writeHead(200, {'Content-Type': 'image/webp' });
	res.end(null);
};

// 设置当前请求的权重
function getWeight(log) {
	var cvar, firstPubTime, weight = 1;
	if (log.cvar) {
		try {
			cvar = JSON.parse(log.cvar);
		} catch(e) {
			console.log('cvar', log.cvar);
			return weight;
		}

		firstPubTime = cvar['2'] && cvar['2'][1];
		if (firstPubTime && util.diffDays(new Date(), firstPubTime) > 0 && util.diffDays(new Date(), firstPubTime) < 14) {
			weight = _.random(CONFIG_PV_WEIGHT[0], CONFIG_PV_WEIGHT[1]);
		}
	}
	return weight;
}


