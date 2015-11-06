var gulp       = require('gulp');
var gls        = require('gulp-live-server');
var stylus     = require('gulp-stylus');
var source     = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify   = require('reactify');
var minifyify  = require('minifyify');
var babelify   = require('babelify');

var paths = {
  main_css : [ 'app/client/stylesheets/main.styl' ],
  css      : [ 'app/client/stylesheets/**/*.styl' ],
  main_js  : [ 'app/client/app.js' ],
  js       : [ 'app/client/**/*.js*' ],
};

gulp.task('css', function() {
  return gulp .src(paths.main_css)
              .pipe(stylus())
              .pipe(gulp.dest('app/static/css/'));
});

gulp.task('js', function() {
  var bundler = browserify(paths.main_js)
                .transform(reactify)
                .transform(babelify);

  if (process.env.NODE_ENV === 'production') {
    bundler = bundler.plugin('minifyify', {
      map      : false,
      compress : {
        drop_debugger : true,
        drop_console  : true
      }
    })
  }

  return bundler.bundle()
                .pipe(source('bundle.js'))
                .pipe(gulp.dest('app/static/js'));
});

gulp.task('serve', [ 'css', 'js' ], function () {
  // Generic watch tasks for Stylus and Browserify
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
