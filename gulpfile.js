'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var rimraf = require('rimraf');
var hbsfy = require('hbsfy')


/****************************************
  JS
*****************************************/

var bundler = browserify({
  entries: ['./public/scripts/index.js'],
  debug: true
});

bundler.on('log', gutil.log); // output build logs to terminal

gulp.task('clean', function (cb) {
  rimraf('public/build', cb);
});

gulp.task('build', ['clean'], function () {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/build'));
});


/****************************************
  Watch
*****************************************/

gulp.task('watch', ['build'], function () {
  return gulp.watch(['public/scripts/**/*.js', 'public/templates/**/*.hbs'], ['build'])
})

// Default
gulp.task('default', ['watch']);