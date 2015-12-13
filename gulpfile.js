var gulp          = require('gulp');
var gls           = require('gulp-live-server');
var sass          = require('gulp-sass');
var source        = require('vinyl-source-stream');
var browserify    = require('browserify');
var minifyify     = require('minifyify');
var babelify      = require('babelify');
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

var paths = {
  main_css : [ 'app/client/stylesheets/main.scss' ],
  css      : [ 'app/client/stylesheets/**/*.scss' ],
  main_js  : [ 'app/client/app.js' ],
  js       : [ 'app/client/**/*.js*' ],
};

gulp.task('css', function() {
  return gulp .src(paths.main_css)
              .pipe(
                sass({
                  outputStyle: IS_PRODUCTION ? 'compressed' : 'nested'
                }).on('error', sass.logError)
              )
              .pipe(gulp.dest('app/static/css/'));
});

gulp.task('js', function() {
  var bundler = browserify(paths.main_js)
                .transform('babelify', {
                  presets : [ 'es2015', 'react' ]
                });

  if (IS_PRODUCTION) {
    bundler = bundler.plugin('minifyify', {
      map      : false,
      compress : {
        drop_debugger : true,
        drop_console  : true
      }
    })
  }

  bundler.bundle().on('error', function(err) {
    console.error('[browserify error]', err.message);
  }).pipe(source('bundle.js'))
    .pipe(gulp.dest('app/static/js'));
});

gulp.task('serve', [ 'css', 'js' ], function () {
  // Generic watch tasks for SASS and Browserify
  gulp.watch(paths.css, [ 'css' ]);
  gulp.watch(paths.js,  [ 'js'  ]);

  // Start the app server.
  var server = gls('app/server/index.js', { stdio : 'inherit' });
  server.start();

  // Reload server when backend files change.
  gulp.watch([ 'app/server/**/*.js' ], function() {
    server.start.bind(server)();
  });

  // Notify server when frontend files change.
  gulp.watch([ 'app/static/**/*.{css,js,html}' ], function(file) {
    server.notify(file);
  });
});

gulp.task('default', [ 'css', 'js' ]);
