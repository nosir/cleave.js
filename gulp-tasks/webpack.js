var gulp = require('gulp');
var webpack = require('webpack-stream');
var path = require('path');

var paths = {
    root: './',
    dist: './dist/',
    src:  './src/'
};

var entry = 'react.js';

gulp.task('js:react:webpack', function () {
    return gulp.src(path.join(paths.root, entry))
        .pipe(webpack({
            entry:     './src/Cleave.react.js',
            output:    {
                library:       'Cleave',
                libraryTarget: 'umd',
                filename:      'cleave-react.webpack.js'
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
