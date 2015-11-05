var gulp        = require("gulp");
var sass        = require("gulp-sass");
var jshint      = require("gulp-jshint");
var browserSync = require("browser-sync").create();
var browserify  = require("browserify");
var babelify    = require("babelify");
var source      = require('vinyl-source-stream');

var buildDir    = "./build";

browserSync.init({
    server: {
        baseDir: "./"
    }
});

gulp.task("styles", function() {
    gulp.src("sass/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest(buildDir + "/css/"));
});

function transpileScripts(filePath) {
    browserify(filePath, {debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source(filePath))
        .pipe(gulp.dest(buildDir));
}

gulp.task("jshint", function() {
    return gulp.src("src/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("default", function() {
    var scripts = gulp.watch("src/**/*.js", ["jshint"]).on("change", browserSync.reload);

    scripts.on("change", function(evt) {
        transpileScripts(evt.path);
    });

    gulp.watch("sass/**/*.scss", ["styles"]).on("change", browserSync.reload);
    gulp.watch("./**/*.html").on("change", browserSync.reload);
});
