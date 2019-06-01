'use strict';

//-----------------------------------------------------------required plugins
const gulp = require('gulp');
const sass = require('gulp-sass');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const mincss = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const include = require('gulp-file-include');
const sprite = require('gulp-svg-sprite');
const combiner = require('stream-combiner2').obj;
const browserSync = require('browser-sync').create();

//-----------------------------------------------------------build environment
const isDev = !process.env.ENV || process.env.ENV == "dev";

//-----------------------------------------------------------styles
gulp.task('styles', function() {
   return combiner(
       gulp.src('src/sass/main.sass'),
       //debug({title: 'sass-src'}),
       gulpIf(isDev, sourcemaps.init()),
       sass(),
       //debug({title: 'sass-compile'}),
       autoprefixer(),
       //debug({title: 'sass-autoprefixer'}),
       gulpIf(!isDev, mincss()),
       gulpIf(isDev, sourcemaps.write()),
       gulp.dest('build/styles')
       ).on('error', notify.onError(function (err) {
           return {
               title: 'styles',
               message: err.message
           };
       }))
});

//-----------------------------------------------------------assets
gulp.task('assets', function () {
    return combiner (
        gulp.src('src/assets/*.html', ),
        //newer('build'),
        include({
            prefix: '@@'
        }),
        //debug({title: 'assets'}),
        gulp.dest('build')
    ).on('error', notify.onError(function (err) {
        return {
            title: 'assets',
            message: err.message
        };
    }));
});

//-----------------------------------------------------------js
gulp.task('js', function () {
    return combiner (
        gulp.src('src/js/main.js'),
        include({
            prefix: '@@'
        }),
        //debug({title: 'js-src'}),
        gulpIf(isDev, sourcemaps.init()),
        gulpIf(!isDev, uglify()),
        gulpIf(isDev, sourcemaps.write()),
        gulp.dest('build/js/')
    ).on('error', notify.onError(function (err) {
        return {
            title: 'img',
            message: err.message
        };
    }));
});

//-----------------------------------------------------------img
gulp.task('img', function () {
    return combiner (
        gulp.src('src/img/*.*'),
        newer('build'),
        gulpIf(isDev, imagemin()), // manually TinyPNG
        gulp.dest('build/img')
    ).on('error', notify.onError(function (err) {
        return {
            title: 'img',
            message: err.message
        };
    }));
});

//-----------------------------------------------------------svg-sprites
gulp.task('sprites', function () {
    return combiner (
        gulp.src('src/img/sprites/*.svg'),
        sprite({
            mode: {
                css: {
                    dest: '.',
                    bust: false,
                    sprite: 'sprite.svg',
                    layout: 'vertical',
                    prefix: '%%',
                    dimensions: true,
                    render: {
                        scss: {
                            dest: 'sprite.scss'
                        }
                    }
                }
            }
        }),
        debug({title: 'sprites'}),
        gulpIf('*.scss', gulp.dest('src/sass'), gulp.dest('build/styles')),
    ).on('error', notify.onError(function (err) {
        return {
            title: 'sprites',
            message: err.message
        };
    }));
});

//-----------------------------------------------------------fonts
gulp.task('fonts', function () {
    return combiner (
        gulp.src('src/fonts/**'),
        newer('build'),
        gulp.dest('build/fonts')
    ).on('error', notify.onError(function (err) {
        return {
            title: 'fonts',
            message: err.message
        };
    }));
});

//-----------------------------------------------------------clean
gulp.task('clean', function () {
    return del(['build/**', '!build/img/**', '!build'])
});

//-----------------------------------------------------------build
gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('sprites', 'styles', 'assets', 'img', 'js', 'fonts'))
);

//-----------------------------------------------------------serve (browserSync)
gulp.task('serve', function () {
    browserSync.init({
        server: 'build'
    });
    browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

//-----------------------------------------------------------watch
gulp.task('watch', function () {
    gulp.watch('src/sass/**/*.*', gulp.series('styles'));
    gulp.watch('src/assets/**/*.*', gulp.series('assets'));
    gulp.watch('src/img/*.*', gulp.series('img'));
    gulp.watch('src/js/**/*.*', gulp.series('js'));
    gulp.watch('src/js/**/*.*', gulp.series('fonts'));
    gulp.watch('src/img/sprites/*.*', gulp.series('sprites'));
});

//-----------------------------------------------------------dev
gulp.task('default',
    gulp.series('build', gulp.parallel('watch', 'serve'))
);