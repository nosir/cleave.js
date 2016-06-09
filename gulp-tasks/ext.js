var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var gulpsync = require('gulp-sync')(gulp);

var paths = {
    lib:  './lib',
    dist: './dist'
};

gulp.task('ext:clean', function () {
    return gulp.src([
            path.join(paths.dist, 'ext/*.js')
        ])
        .pipe(rimraf());
});

gulp.task('ext:build', function () {
    return gulp.src(path.join(paths.lib, '*.js'))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('phone-type-formatter', 'cleave-phone');
        }))
        .pipe(gulp.dest(path.join(paths.dist, 'ext')));
});

gulp.task('ext', gulpsync.sync(['ext:clean', 'ext:build']));
