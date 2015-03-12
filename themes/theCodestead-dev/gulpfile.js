// if npm i doesn't work, install dependencies manually:
// npm i --save-dev gulp gulp-sass gulp-autoprefixer gulp-csso gulp-sourcemaps gulp-plumber gulp-size vinyl-source-stream vinyl-buffer gulp-util watchify browserify gulp-jshint jshint-stylish gulp-uglify del gulp-shell gulp-watch

var gulp          = require('gulp')
var sass          = require('gulp-sass')
var autoprefixer  = require('gulp-autoprefixer')
var csso          = require('gulp-csso')
var sourcemaps    = require('gulp-sourcemaps')
var plumber       = require('gulp-plumber')
var size          = require('gulp-size')
var source        = require('vinyl-source-stream')
var buffer        = require('vinyl-buffer')
var gutil         = require('gulp-util')
var watchify      = require('watchify')
var browserify    = require('browserify')
var jshint        = require('gulp-jshint')
var uglify        = require('gulp-uglify')
var del           = require('del')
var shell         = require('gulp-shell')
var watchG        = require('gulp-watch')

// ------------------------------------------
// Notes:
// - Two builds: 
//   1) For development (tmp)
//     - unminified 
//     - source mapped
//     - linted
//     - root located in current
//       directory to mirror deployment
//   2) for deployment (ship)
//     - minified
//     - located anywhere, such as in 
//       platform-specific theme locations
// - Easy to extend existing tasks.
//
// Usage:
// For Development: 2 gulp commands, 2 terminals, same directory
// gulp hugo-watch
// gulp watch
// For Production:
// Done. This approach constantly builds your production/shippable 
// ready theme in the base "themes" directory. By default, this is 
// named "Awesome-New-Theme"... customize below.

// --- Configuration below ---

// Theme Name
var theme_name = "theCodestead-1"
// development Theme Name
var theme_name_dev = "theCodestead-dev"

// Destination for deploy package
// located at root of 'themes' directory
var dest_root = "./../" + theme_name + "/"

// All other config here: 
var config = { 

  // sources
  copy_meta:    ['*.{md,txt,yaml,json,toml}', '!./node_modules/**', '!./package.json', '!./static-src/**/*', '!./layouts/**/*'],
  img_src:      "static-src/assets/images/**/*.{jpg,jpeg,png,svg}",
  sass_src:     "static-src/assets/sass/**/*.{sass,scss}",
  js_src:       "static-src/assets/js/**/*.js",
  js_src_entry: "./static-src/assets/js/index.js",
  
  // tmp locations for development
  tmp_js:   "./static/assets/js",
  tmp_css:  "static/assets/css",

  // name for single browserified bundle
  bundle_js: "bundle.js",

  // specific destination paths
  dest_js:   dest_root + "static/assets/js",
  dest_css:  dest_root + "static/assets/css",
  dest_img:  dest_root + "static/assets/images"
}


// -- No Config Needed Below --
// -- only additions/customizations

// -----------------------
// Convenience task to run 
// hugo watch for the development
// theme from its root directory

gulp.task('hugo', function() {
  return gulp.src('', {read: false})
    .pipe(shell('hugo server --theme=' + theme_name_dev + ' --buildDrafts --watch', {
      cwd: "./../../"
    }))
})


// -----------------------
// Core Tasks

gulp.task('default', ['clean'], function() {
  gulp.start('watch')
})

gulp.task('watch', ['copy-layouts', 'copy-meta', 'copy-images', 'sass-dev', 'sass-ship', 'jshint', 'browserify', 'js_ship'], function() {
  watchG( 'layouts/**/*.html', function() {
    gulp.start(['delete-layouts', 'copy-layouts'])
  })
  watchG( config.copy_meta, function() {
    gulp.start(['delete-meta', 'copy-meta'])
  })
  gulp.watch( config.sass_src, ['sass-dev', 'sass-ship'] )
  watchG( config.js_src, function() {
    gulp.start('jshint')
  })
  watchG( config.img_src, function() {
    gulp.start(['copy-images'])
  })

})
  
gulp.task('clean', function(cb) {
  del([
    dest_root,
    config.tmp_js,
    config.tmp_css
  ], {force: true}, cb)
})


// -----------------------
// SASS --> CSS

gulp.task('sass-dev', function() {
  return gulp.src( config.sass_src )
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(sass({
        errLogToConsole: true
      }))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 9", { cascade: false }))
    .pipe(gulp.dest( config.tmp_css ))
})
gulp.task('sass-ship', function() {
  return gulp.src( config.sass_src )
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 9", { cascade: false }))
    .pipe(csso())
    .pipe(size({
      showFiles: true,
      title: "Size css-min:"
    }))
    .pipe(gulp.dest( config.dest_css ))
})


// -----------------------
// Copy
// (eg: .html, .template, .md, .txt, etc)

gulp.task('copy-layouts', function() {
  return gulp.src("layouts/**/*")
    .pipe(gulp.dest( dest_root + 'layouts/' ))
})
gulp.task('copy-meta', function() {
  return gulp.src(config.copy_meta)
    .pipe(gulp.dest( dest_root ))
})
gulp.task('copy-images', function() {
  return gulp.src(config.img_src) 
    .pipe(gulp.dest( config.dest_img ))
})


// Clear layout folder on save, preventing orphans 
// Note: the watch tasks for this uses 'gulp-watch'
// which only passes through modified files.
// This means we can safely call these asyncly 
// with the above copy tasks.
gulp.task('delete-layouts', function(cb) {
  del([ 
    dest_root + 'layouts/**/*'
  ], {force: true}, cb)
})
gulp.task('delete-meta', function(cb) {
  del([ 
    dest_root + '*.{md,txt,yaml,json,toml}'
  ], {force: true}, cb)
})

// -----------------------
// Js --> single bundle

var bundler = watchify(browserify(config.js_src_entry, {
  cache: {},
  packageCache: {},
  fullPaths: true,
  debug: true
}))

// wait for JsHint, then Browserify
gulp.task('browserify', ['jshint'], bundle)

bundler.on('update', bundle)

function bundle() {
  return bundler.bundle() 
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source( 'bundle.js' ))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest( config.tmp_js ))
}

gulp.task('js_ship', ['browserify'], function() {
  return gulp.src( config.tmp_js + "/**/*.js")
    .pipe(uglify())
    .pipe(size({
      showFiles: true,
      title: "Size js-min:",
    }))
    .pipe(gulp.dest( config.dest_js ))
})

gulp.task('jshint', function() {
  return gulp.src( config.js_src )
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
})
