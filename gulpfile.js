var gulp = require('gulp')
var babel = require('gulp-babel')
var del = require('del')

// var pug = require('gulp-pug');
// var less = require('gulp-less');
// var minifyCSS = require('gulp-csso');

// gulp.task('html', function(){
//   return gulp.src('client/templates/*.pug')
//     .pipe(pug())
//     .pipe(gulp.dest('build/html'))
// });

// gulp.task('css', function(){
//   return gulp.src('client/templates/*.less')
//     .pipe(less())
//     .pipe(minifyCSS())
//     .pipe(gulp.dest('build/css'))
// });

gulp.task('server:clean', function () {
  return del('lib/**', { force: true })
})

gulp.task('server:preview', function () {
  return gulp.src(['src/preview/**/*']).pipe(gulp.dest('lib/preview'))
})

gulp.task('server:templates', function () {
  return gulp.src(['src/templates/**/*']).pipe(gulp.dest('lib/templates'))
})

gulp.task('server:js', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('lib'))
})

gulp.task('server:static', gulp.parallel('server:preview', 'server:templates'))

gulp.task('build:server', gulp.series(
  'server:clean',
  'server:static',
  'server:js'
))

gulp.task('watch:server:js', function () {
  gulp.watch('src/*.js', gulp.parallel('server:js'))
})

gulp.task('watch:server', gulp.series(
  'build:server', // build once
  'watch:server:js' // watch and rebuild js-files
))
