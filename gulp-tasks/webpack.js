var gulp = require('gulp');
var webpack = require('webpack-stream');
var path = require('path');

var paths = {
    root: './',
    dist: './dist/',
    src:  './src/'
};

gulp.task('js:vanilla', function () {
    return gulp.src(path.join(paths.src + 'Cleave.js'))
        .pipe(webpack({
            output: {
                library:       'Cleave',
                libraryTarget: 'umd',
                filename:      'cleave.js'
            }
        }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js:react', function () {
    return gulp.src(path.join(paths.src, 'Cleave.react.js'))
        .pipe(webpack({
            output:    {
                library:       'Cleave',
                libraryTarget: 'umd',
                filename:      'cleave-react.js'
            },
            module:    {
                loaders: [
                    {
                        test:    /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        loader:  'babel',
                        query:   {
                            presets: ['es2015', 'react', 'stage-0']
                        }
                    }
                ]
            },
            externals: [
                {
                    'react':     {
                        root:      'React',
                        commonjs2: 'react',
                        commonjs:  'react',
                        amd:       'react'
                    },
                    'react-dom': {
                        root:      'ReactDOM',
                        commonjs2: 'react-dom',
                        commonjs:  'react-dom',
                        amd:       'react-dom'
                    }
                }
            ]
        }))
        .pipe(gulp.dest(paths.dist));
});
