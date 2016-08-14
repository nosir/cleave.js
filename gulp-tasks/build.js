var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var header = require('gulp-header');
var gulpsync = require('gulp-sync')(gulp);
var fs = require('fs');

var getLicense = function () {
    return '' + fs.readFileSync('./src/build/license.txt');
};

var packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));

var paths = {
    src:       './src',
    build:     'build',
    utils:     'utils',
    common:    'common',
    shortcuts: 'shortcuts',
    dist:      './dist'
};

gulp.task('min', function () {
    return gulp.src([
            path.join(paths.dist, 'cleave.js'),
            path.join(paths.dist, 'cleave-react.js'),
            path.join(paths.dist, 'cleave-angular.js')
        ])
        .pipe(uglify({mangle: true}))
        .pipe(header(getLicense(), {
            version: packageInfo.version,
            build:   (new Date()).toUTCString()
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(paths.dist)));
});

gulp.task('js', function () {
    return gulp.src([
            path.join(paths.src, paths.build, 'prefix.js'),
            path.join(paths.src, 'Cleave.js'),
            path.join(paths.src, paths.utils, '**/*.js'),
            path.join(paths.src, paths.common, '**/*.js'),
            path.join(paths.src, paths.shortcuts, '**/*.js'),
            path.join(paths.src, paths.build, 'expose.js'),
            path.join(paths.src, paths.build, 'suffix.js')
        ])
        .pipe(concat('cleave.js'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js:angular', function () {
    return gulp.src([
            path.join(paths.dist, 'cleave.js'),
            path.join(paths.src, 'Cleave.angular.js')
        ])
        .pipe(concat('cleave-angular.js'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('build', gulpsync.sync(['js', 'js:react', 'js:angular', 'min']));
