var gulp = require('gulp');
var webpack = require('webpack-stream');
var path = require('path');
var concat = require('gulp-concat');

var paths = {
    tmp: './tmp',
    root: './',
    dist: './dist/',
    src: './src/'
};

gulp.task('js:vanilla', function () {
    return gulp.src(path.join(paths.src + 'Cleave.js'))
        .pipe(webpack({
            output: {
                library: 'Cleave',
                libraryTarget: 'umd',
                filename: 'cleave.js'
            }
        }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js:angular-merge', function () {
    return gulp.src([
            path.join(paths.src, 'Cleave.js'),
            path.join(paths.src, 'Cleave.angular.js')
        ])
        .pipe(concat('cleave-angular.js'))
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('js:angular', function () {
    return gulp.src(path.join(paths.tmp, 'cleave-angular.js'))
        .pipe(webpack({
            output: {
                library: 'Cleave',
                libraryTarget: 'umd',
                filename: 'cleave-angular.js'
            }
        }))
        .pipe(gulp.dest(paths.dist));
});

var module = {
    loaders: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['es2015', 'react', 'stage-0']
            }
        }
    ]
};

var externals = [
    {
        'react': {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom'
        }
    }
];

gulp.task('js:react-node', function () {
    return gulp.src(path.join(paths.src, 'Cleave.react.js'))
        .pipe(webpack({
            output: {
                library: 'Cleave',
                libraryTarget: 'umd',
                filename: 'cleave-react-node.js'
            },
            target: 'node',
            module: module,
            externals: externals
        }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js:react', function () {
    return gulp.src(path.join(paths.src, 'Cleave.react.js'))
        .pipe(webpack({
            output: {
                library: 'Cleave',
                libraryTarget: 'umd',
                filename: 'cleave-react.js'
            },
            module: module,
            externals: externals
        }))
        .pipe(gulp.dest(paths.dist));
});
