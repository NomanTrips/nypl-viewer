var gulp = require('gulp'),
    gutil = require('gulp-util'),
    $ = require('gulp-load-plugins')();

gulp.task('default', function() {
    gulp.src('app/src/**/*.js')
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.ngAnnotate())
        .pipe($.sourcemaps.init())
        .pipe($.concat('bundle.js'))
        .pipe($.uglify().on('error', gutil.log))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('app/assets/js'));
        console.log('Done bundling....');
})