var gulp = require('gulp');
var mocha = require('gulp-mocha');
var path = require('path');
var should = require('should');
var eslint = require('gulp-eslint');
var gulpsync = require('gulp-sync')(gulp);
var mochaPhantomJS = require('gulp-mocha-phantomjs');

var paths = {
    src:  './src',
    test: './test'
};

gulp.task('unit:phone', function () {
    return gulp.src(path.join(paths.test, 'PhoneFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('unit:credit-card', function () {
    return gulp.src(path.join(paths.test, 'CreditCardDetector_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('unit:date', function () {
    return gulp.src(path.join(paths.test, 'DateFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('unit:numeral', function () {
    return gulp.src(path.join(paths.test, 'NumeralFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('unit', function () {
    return gulp.src(path.join(paths.test, 'unit/**/*_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('browser', function () {
    return gulp
        .src([
            path.join(paths.test, 'browser/*.html')
        ])
        .pipe(mochaPhantomJS());
});

gulp.task('eslint', function () {
    return gulp.src([
            path.join(paths.src, '**/*.js'),
            path.join(paths.test, 'unit/**/*.js')
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', gulpsync.sync(['unit', 'browser']));

gulp.task('publish', gulpsync.sync(['build', 'test', 'eslint']));
