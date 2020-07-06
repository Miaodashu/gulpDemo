const { watch, series, src, dest, parallel, task } = require("gulp");
const gulp = require("gulp");
const less = require("gulp-less");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const pipeline = require("readable-stream").pipeline;
const cleanCSS = require("gulp-clean-css");
const rev = require("gulp-rev");
var revCollector = require("gulp-rev-collector");
var minifyHTML = require("gulp-minify-html");
var clean = require("gulp-clean");
// 解析less，生成对应的css
function runLess() {
  return (
    src("./less/**/*.less")
      //进行预编译处理,保持与引入的模块一致
      .pipe(less())
      .pipe(
        autoprefixer({
          grid: true,
          overrideBrowserslist: [
            "Android 4.1",
            "iOS 7.1",
            "Chrome > 31",
            "ff > 31",
            "ie >= 8",
          ],
        })
      )
      //编译后将less编译成的css文件保存到项目目录下的css文件夹中
      .pipe(dest("./css"))
  );
}
// 监听less文件，实时编译css
function watchLess() {
  return watch("./less/**/*.less", series(runLess));
}

// 压缩img
function minImg() {
  return src("./images/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}
//压缩js map后缀
function uglifyJS() {
  return src("./js/*.js")
    .pipe(rev())
    .pipe(uglify())
    .pipe(dest("dist/js"))
    .pipe(rev.manifest())
    .pipe(dest("rev/js"));
}
// 压缩css
function minCss() {
  return src("./css/*.css")
    .pipe(rev())
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest("dist/css"))
    .pipe(rev.manifest())
    .pipe(dest("rev/css"));
}

// 压缩Html,替换文档中的css和js路径
task("rev", function () {
  return gulp
    .src(["rev/**/*.json", "./html/**/*.html"])
    .pipe(
      revCollector({
        replaceReved: true,
        dirReplacements: {
          css: "css",
          js: "js",
        },
      })
    )
    .pipe(
      minifyHTML({
        empty: true,
        spare: true,
      })
    )
    .pipe(gulp.dest("dist/html"));
});
task("clean", function () {
  return src(["./dist", "./rev"], { read: false, allowEmpty: true }).pipe(
    clean()
  );
});
exports.default = series(watchLess);
exports.build = series("clean", minImg, uglifyJS, minCss, "rev");
