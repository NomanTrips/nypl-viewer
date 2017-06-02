var gulp = require('gulp'),
    gutil = require('gulp-util'),
    $ = require('gulp-load-plugins')();

gulp.task('minify', function() {
    gulp.src('app/src/**/*.js')
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.ngAnnotate())
        .pipe($.concat('NyplViewer.min.js'))
        .pipe($.uglify().on('error', gutil.log))
        .pipe(gulp.dest('dist/'));
        console.log('Done bundling....');
})