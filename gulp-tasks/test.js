var gulp = require('gulp');
var mocha = require('gulp-mocha');
var path = require('path');
var gulpsync = require('gulp-sync')(gulp);
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
    src: './src',
    test: './test'
};

gulp.task('mocha:phone', function () {
    return gulp.src(path.join(paths.test, 'PhoneFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('mocha:credit-card', function () {
    return gulp.src(path.join(paths.test, 'CreditCardDetector_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('mocha:date', function () {
    return gulp.src(path.join(paths.test, 'DateFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('mocha', function () {
    return gulp.src(path.join(paths.test, '**/*_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('jshint', function () {
    return gulp.src([
            path.join(paths.src, 'shortcuts/*.js'),
            path.join(paths.src, 'Cleave.js')
        ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('test', gulpsync.sync(['jshint', 'mocha']));
