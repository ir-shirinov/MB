"use strict";

var autoprefixer = require("autoprefixer");
var browserSync = require("browser-sync").create();
var del = require("del");
var gulp = require("gulp");
var csso = require("gulp-csso");
var fileinclude = require("gulp-file-include");
var htmlmin = require('gulp-htmlmin');
var imagemin = require("gulp-imagemin");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var svgstore = require("gulp-svgstore");
var uglify = require("gulp-uglify");
var imageminJpegRecompress = require("imagemin-jpeg-recompress");
var pump = require("pump");
var run = require("run-sequence");
var cheerio = require('gulp-cheerio');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        nozip: 'build/nozip/'
    },
    src: { //Пути откуда брать исходники
        html: 'index.html', 
        js: 'js/script.js',
        style: 'sass/style.scss',
        img: 'img/**/*.*',
        imgsprite : 'img/**/sprite-*.svg', 
        fonts: 'fonts/**/*.*'
    },
    watch: {
        html: './**/*.html',
        js: 'js/**/*.js',
        style: "sass/**/*.{scss,sass}",
        img: 'img/**/*.*',
        fonts: 'fonts/**/*.*'
    },
    site: "./build" // Папка для сервера
};

gulp.task("server", function() {
  browserSync.init({
    server: path.site,
    index: 'index.min.html',
    notify: false,
    open: true,
    cors: true,
    ui: false,
    browser: "firefox",
    tunnel: true //тунель для теста сайта
  });

  gulp.watch(path.watch.style, ["style"]);
  gulp.watch(path.watch.html, ["html"]);
  gulp.watch(path.watch.js, ["js"]).on("change", browserSync.reload);
  gulp.watch(path.watch.img, ["copy"]).on("change", browserSync.reload);
});


gulp.task("html", function(){
  return gulp.src(path.src.html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(path.build.nozip))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
})

gulp.task("js", function (done) {
  pump([
        gulp.src(path.src.js),
        gulp.dest(path.build.nozip),
        uglify(),
        gulp.dest(path.build.js)
    ],
    done
  );
});

gulp.task("style", function() {
  gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest(path.build.nozip))
    .pipe(csso())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
});

gulp.task("sprite", function(){
  return gulp.src(path.src.imgsprite)
    .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(path.build.img));
})


gulp.task("copy", function(){
  return gulp.src([
    path.src.fonts,
    path.src.img,
    'js/circle.js'
  ], {
    base: "."
  })
  .pipe(gulp.dest(path.site));
})

gulp.task("clean", function(){
  return del(path.site);
})

gulp.task("images", function() {
  return gulp.src(path.src.imgorigin)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img/"));
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "js",
    "style",
    "sprite",
    "html",
    done
  );
});

