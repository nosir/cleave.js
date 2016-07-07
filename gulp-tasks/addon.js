var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var gulpsync = require('gulp-sync')(gulp);

var paths = {
    src:    './src',
    addons: 'addons',
    dist:   './dist'
};

gulp.task('addon:clean', function () {
    return gulp.src([
            path.join(paths.dist, paths.addons, '*.js')
        ])
        .pipe(rimraf());
});

gulp.task('addon:build', function () {
    return gulp.src(path.join(paths.src, paths.addons, '*.js'))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('phone-type-formatter', 'cleave-phone');
        }))
        .pipe(uglify({
            preserveComments: 'all'
        }))
        .pipe(gulp.dest(path.join(paths.dist, paths.addons)));
});

gulp.task('addon', gulpsync.sync(['addon:clean', 'addon:build']));
