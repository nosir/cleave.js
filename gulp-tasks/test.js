var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test:phone', function () {
    return gulp.src('./test/PhoneNumberFormatter_spec.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test:credit-card', function () {
    return gulp.src('./test/CreditCardDetector_spec.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test', function () {
    return gulp.src('./test/**/*_spec.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}));
});
