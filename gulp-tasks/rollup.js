const gulp = require('gulp');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const {terser} = require('rollup-plugin-terser');

gulp.task('js:esm', () => {
    return rollup.rollup({
        input: './src/Cleave.js',
        plugins: [commonjs()]
    }).then(bundle => {
        return bundle.write({
            file: './dist/cleave-esm.js',
            format: 'esm',
            sourcemap: false
        });
    });
});

gulp.task('js:esm-min', () => {
    return rollup.rollup({
        input: './src/Cleave.js',
        plugins: [
            commonjs(),
            terser(),
        ]
    }).then(bundle => {
        return bundle.write({
            file: './dist/cleave-esm.min.js',
            format: 'esm',
            compact: true
        });
    });
});
