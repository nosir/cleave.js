/*jslint node: true, nomen: true*/
'use strict';

var watchify = require('watchify');
var errorify = require('errorify');
var browserify = require('browserify');
var shim = require('browserify-shim');
var babelify = require("babelify");
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var path = require("path");

var paths = {
    root:  './',
    dist:  './dist/',
    src:   './src/'
};

var entry = 'react.js';

var options = {
    cache:        {},
    packageCache: {},
    debug:        true // sourcemapping
};

function bundle(w, e) {
    return w.bundle()
        .pipe(source(e.replace('react', 'cleave-react')))
        //.pipe(source(e))
        .pipe(gulp.dest(paths.dist));
}

gulp.task('js:react:watch', function () {
    options.entries = [path.join(paths.root, entry)];
    options.plugin = [watchify, errorify];

    var w = browserify(options);

    w.on('update', function () {
        bundle(w, entry);
    });

    w.on('log', function (msg) {
        console.log(msg);
    });

    bundle(w, entry);

    return w;
});

gulp.task('js:react', function () {
    options.entries = [path.join(paths.root, entry)];
    options.plugin = [errorify];

    return bundle(browserify(options), entry);
});
