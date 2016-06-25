var gulp = require('gulp');
var mocha = require('gulp-mocha');
var path = require('path');
var should = require('should');
var eslint = require('gulp-eslint');
var gulpsync = require('gulp-sync')(gulp);

var paths = {
    src:  './src',
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

gulp.task('mocha:numeral', function () {
    return gulp.src(path.join(paths.test, 'NumeralFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('mocha', function () {
    return gulp.src(path.join(paths.test, '**/*_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('eslint', function () {
    return gulp.src([
            path.join(paths.src, '**/*.js'),
            path.join(paths.test, '**/*.js')
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', gulpsync.sync(['eslint', 'mocha']));
