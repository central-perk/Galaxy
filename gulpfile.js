var path        = require('path'),
	_           = require('lodash'),
	gulp        = require('gulp'),
	$$          = require('gulp-load-plugins')();

// 监控服务端文件改动，并重启
gulp.task('restart', function() {

	// 监控服务端模板，脚本
	$$.nodemon({
		// 注意这边watch的写法
		// https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md
		watch: ['server/'],
		script: 'server/server.js',
		ext: 'js json'
	})
	.on('restart', function() {
		console.log('restarted!');
	});
});

gulp.task('default', ['restart']);