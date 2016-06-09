var gulp = require('gulp');
var mocha = require('gulp-mocha');
var path = require('path');

var paths = {
    test: './test'
};

gulp.task('test:phone', function () {
    return gulp.src(path.join(paths.test, 'PhoneFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test:credit-card', function () {
    return gulp.src(path.join(paths.test, 'CreditCardDetector_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test:date', function () {
    return gulp.src(path.join(paths.test, 'DateFormatter_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test', function () {
    return gulp.src(path.join(paths.test, '**/*_spec.js'), {read: false})
        .pipe(mocha({reporter: 'spec'}));
});
