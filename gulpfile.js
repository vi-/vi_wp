'use strict';

const gulp 					= require('gulp'),
			concat 				= require('gulp-concat'),
			uglify 				= require('gulp-uglify'),
			rename 				= require('gulp-rename'),
			sass 					= require('gulp-sass'),
			maps					= require('gulp-sourcemaps'),
			babel					= require('gulp-babel'),
			del 					=	require('del'),
			cssnano				=	require('gulp-cssnano'),
			browserSync 	= require('browser-sync').create(),
			autoprefixer	= require('gulp-autoprefixer'),
			imagemin			= require('gulp-imagemin');

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
		.pipe(sass().on('error', function(err) {
			console.error(err.message);
    	browserSync.notify(err.message, 3000);
    	this.emit('end');
		}))
		.pipe(rename('style.css'))
		.pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
    }))
		.pipe(maps.write('./'))
		.pipe(gulp.dest('css'));
});

gulp.task("minStyles", ["sass"], () => { 
	return gulp.src('css/style.css')
		.pipe(cssnano())
		.pipe(gulp.dest('css')); 
});

gulp.task("minImages", () => {
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('images/'))
});

gulp.task("serve", ["sass", "prepScripts", "minImages"], () => {
	browserSync.init({
		proxy: "woah.dev"
	});
	gulp.watch('src/scss/**/*.scss', ["sass"]);
	gulp.watch('src/js/*.js', ["prepScripts"]);
	gulp.watch('src/images/*', ["minImages"]);
	gulp.watch('css/style.css').on('change', browserSync.reload);
	gulp.watch('js/script.js').on('change', browserSync.reload);
	gulp.watch('*.php').on('change', browserSync.reload);
	gulp.watch('**/*.php').on('change', browserSync.reload);
	gulp.watch('images/*').on('change', browserSync.reload);
});

gulp.task("clean", () => {
	del([
		'dist',
		'images',
		'css/style.css*',
		'js/script.js*'
	]);
});

gulp.task("browser-sync", () => {
	browserSync.init({
		proxy: "woah.dev"
	});
});

gulp.task("build", [ "minScripts", "minStyles" ], () => {
	return gulp.src([
			'css/style.css',
			'images/**',
			'inc/**',
			'js/script.js',
			'*.php',
			'style.css',
			'screenshot.png',
			'template-parts/**'
		], { base: './' })
	.pipe(gulp.dest('dist'));
});

gulp.task("default", [ "clean" ], () => gulp.start("build"));