var gulp  = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var sass  = require("gulp-sass");
var babel = require("gulp-babel");
var browserSync = require("browser-sync").create();

var buildDir = "./build";

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

gulp.task("scripts", function() {
	return gulp.src("src/**/*.js")
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(gulp.dest(buildDir + "/scripts/"));
});

gulp.task("default", function() {
	gulp.watch("src/**/*.js", ["scripts"]);
	gulp.watch("sass/**/*.scss", ["styles"]);
	gulp.watch("./**/*.html").on("change", browserSync.reload);
});
