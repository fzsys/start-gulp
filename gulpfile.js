'use strict';

//-----------------------------------------------------------required plugins
const gulp = require('gulp');

const sass = require('gulp-sass');
//const concat = require('gulp-concat');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const mincss = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
//const plumber = require('gulp-plumber');
const combiner = require('stream-combiner2').obj;
const browserSync = require('browser-sync').create();

//const gulpLoadPlugins = require('gulp-load-plugins');
//const $ = gulpLoadPlugins();

//const paths = require('./gulp/path');

const isDev = !process.env.ENV || process.env.ENV == "dev";

//-----------------------------------------------------------lazyRequireTask
function lazyRequireTask(taskName, path, options) {
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function(callback) {
        var task = require(path).call(this, options);

        return task(callback);
    });
}

//-----------------------------------------------------------browserSync
gulp.task('serve', function () {
    browserSync.init({
        server: 'build'
    });
    browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

//-----------------------------------------------------------styles
gulp.task('styles', function() {
   return combiner(
       gulp.src('src/sass/main.sass'),
       debug({title: 'src'}),
       gulpIf(isDev, sourcemaps.init()),
       //debug({title: 'mapInit'}),
       sass(),
       debug({title: 'sass'}),
       autoprefixer(),
       debug({title: 'autoprefixer'}),
       gulpIf(!isDev, mincss()),
       //concat('css/main.css'),
       //debug({title: 'concat'}),
       gulpIf(isDev, sourcemaps.write()),
       //debug({title: 'mapWrite'}),
       gulp.dest('build/css')
       ).on('error', notify.onError(function (err) {
           return {
               title: 'styles',
               message: err.message
           };
       }))
});

//-----------------------------------------------------------clean
gulp.task('clean', function () {
   return del(['build/**', '!build/img/**', '!build'])
});

//-----------------------------------------------------------html
gulp.task('assets', function () {
    return gulp.src('src/assets/**', {since: gulp.lastRun('assets')})
        .pipe(newer('build'))
        .pipe(debug({title: 'assets'}))
        .pipe(gulp.dest('build'));
});

//-----------------------------------------------------------images
gulp.task('img', function () {
    return gulp.src('src/img/**')
        .pipe(gulpIf(isDev, imagemin()))
        .pipe(gulp.dest('build/img'));
});

//-----------------------------------------------------------build
gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'assets', 'img'))
);

//-----------------------------------------------------------watch
gulp.task('watch', function () {
    gulp.watch('src/sass/**/*.*', gulp.series('styles'));
    gulp.watch('src/assets/**/*.*', gulp.series('assets'));
    gulp.watch('src/img/**/*.*', gulp.series('img'));
});

//-----------------------------------------------------------dev
gulp.task('dev',
    gulp.series('build', gulp.parallel('watch', 'serve'))
);