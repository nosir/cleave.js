var gulp = require('gulp');
var concat = require('gulp-concat');
var path = require('path');

var paths = {
    src:       './src',
    build:     'build',
    shortcuts: 'shortcuts',

    dist: './dist'
};

gulp.task('concat', function () {
    return gulp.src([
            path.join(paths.src, paths.build, 'prefix.js'),
            path.join(paths.src, 'Cleave.js'),
            path.join(paths.src, paths.shortcuts, '**/*.js'),
            path.join(paths.src, paths.build, 'suffix.js'),
        ])
        .pipe(concat('cleave.js'))
        .pipe(gulp.dest(paths.dist));
});

