var path = require('path'),
_ = require('lodash'),
gulp = require('gulp'),
$$ = require('gulp-load-plugins')();

// Monitor server file changes and restart
gulp.task('restart', function() {

// Monitor server templates, scripts
$$.nodemon({
// Pay attention to the writing of watch here
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