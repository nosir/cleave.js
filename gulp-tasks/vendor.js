var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var gulpsync = require('gulp-sync')(gulp);

var paths = {
    src:    './src',
    vendor: 'vendor',
    dist:   './dist'
};

gulp.task('vendor:clean', function () {
    return gulp.src([
            path.join(paths.dist, paths.vendor, '*.js')
        ])
        .pipe(rimraf());
});

gulp.task('vendor:build', function () {
    return gulp.src(path.join(paths.src, paths.vendor, '*.js'))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('phone-type-formatter', 'cleave-phone');
        }))
        .pipe(gulp.dest(path.join(paths.dist, paths.vendor)));
});

gulp.task('vendor', gulpsync.sync(['vendor:clean', 'vendor:build']));
