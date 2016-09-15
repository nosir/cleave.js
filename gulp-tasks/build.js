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

gulp.task('min-mangle', function () {
    return gulp.src([
            path.join(paths.dist, 'cleave.js'),
            path.join(paths.dist, 'cleave-react.js')
        ])
        .pipe(uglify({mangle: true}))
        .pipe(header(getLicense(), {
            version: packageInfo.version,
            build:   (new Date()).toUTCString()
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(paths.dist)));
});

gulp.task('min-no-mangle', function () {
    return gulp.src([
            path.join(paths.dist, 'cleave-angular.js')
        ])
        .pipe(uglify({mangle: false}))
        .pipe(header(getLicense(), {
            version: packageInfo.version,
            build:   (new Date()).toUTCString()
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(paths.dist)));
});

gulp.task('js:angular', function () {
    return gulp.src([
            path.join(paths.dist, 'cleave.js'),
            path.join(paths.src, 'Cleave.angular.js')
        ])
        .pipe(concat('cleave-angular.js'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('build', gulpsync.sync([
    // sync
    'js:vanilla',
    'js:react',
    'js:angular',
    [
        // async
        'min-mangle',
        'min-no-mangle'
    ]
]));
