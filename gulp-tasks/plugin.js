var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var gulpsync = require('gulp-sync')(gulp);

var paths = {
    src:    './src',
    plugin: 'plugin',
    dist:   './dist'
};

gulp.task('plugin:clean', function () {
    return gulp.src([
            path.join(paths.dist, paths.plugin, '*.js')
        ])
        .pipe(rimraf());
});

gulp.task('plugin:build', function () {
    return gulp.src(path.join(paths.src, paths.plugin, '*.js'))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('phone-type-formatter', 'cleave-phone');
        }))
        .pipe(gulp.dest(path.join(paths.dist, paths.plugin)));
});

gulp.task('plugin', gulpsync.sync(['plugin:clean', 'plugin:build']));
