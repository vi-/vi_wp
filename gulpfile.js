'use strict';

const gulp 		= require('gulp'),
			concat 	= require('gulp-concat'),
			uglify 	= require('gulp-uglify'),
			rename 	= require('gulp-rename'),
			sass 		= require('gulp-sass'),
			maps		= require('gulp-sourcemaps'),
			babel		= require('gulp-babel'),
			del 		=	require('del');

gulp.task("prepScripts", () => {
	return gulp.src([ 
		'src/js/dependencies.js', 
		'src/js/definitions.js', 
		'src/js/execution.js'])
	.pipe(maps.init())
	.pipe(babel())
	.pipe(concat('script.js'))
	.pipe(maps.write('.'))
	.pipe(gulp.dest("js"));
});

gulp.task("minScripts", ["prepScripts"], () => {
	return gulp.src("js/script.js")
		.pipe(uglify())
		.pipe(gulp.dest('js'));
});

gulp.task("sass", () => {
	return gulp.src('src/scss/main.scss')
		.pipe(maps.init())
		.pipe(sass())
		.pipe(rename('style.css'))
		.pipe(maps.write('./'))
		.pipe(gulp.dest('css'));
});

gulp.task("watch", () => { 
	gulp.watch('src/scss/**/*.scss', ["sass"]);
	gulp.watch('src/js/*.js', ["prepScripts"]);
});

gulp.task("serve", ["watch"]);

gulp.task("clean", () => {
	del([
		'dist',
		'css/style.css*',
		'js/script.js*'
	]);
})

gulp.task("build", [ "minScripts", "sass" ], () => {
	return gulp.src([
			'css/style.css',
			'inc/**',
			'js/script.js',
			'layouts/**',
			'template-parts/**',
			'*.php',
			'style.css',
			'screenshot.png'
		], { base: './' })
	.pipe(gulp.dest('dist'));
});

gulp.task("default", [ "clean" ], () => gulp.start("build"));