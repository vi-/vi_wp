'use strict';

const { series, parallel, src, dest, watch } = require( 'gulp' );

const	uglify				= require('gulp-uglify'),
			sass					= require('gulp-sass'),
			maps					= require('gulp-sourcemaps'),
			babelify			= require('babelify'),
			cssnano				= require('gulp-cssnano'),
			browserSync		= require('browser-sync').create(),
			autoprefixer	= require('gulp-autoprefixer'),
			imagemin			= require('gulp-imagemin'),
			browserify		= require('browserify'),
			source				= require('vinyl-source-stream'),
			buffer				= require('vinyl-buffer');

const serveSite = ( cb ) => {
	browserSync.init({
		proxy: "starter.test"
	});
	watchFiles();
}

const compileCSS = () => {
	return src( 'src/scss/*.scss' )
		.pipe( maps.init() )
		.pipe( sass().on( 'error', function(err) {
			console.error( err.message );
			browserSync.notify( err.message, 3000 );
			this.emit( 'end' );
		}))

		.pipe(autoprefixer({
						browsers: [ 'last 2 versions' ],
						cascade: false
		}))
		.pipe(maps.write( './' ))
		.pipe(dest( 'css' ))
		.pipe(browserSync.stream());
}

const minifyCSS = () => {
	return src( 'css/*.css' )
		.pipe(cssnano())
		.pipe(dest( 'css' ));
}

const compileJS = () => {
	const b = browserify({
	  entries: './src/js/myscript.js',
	  debug: true,
	  transform: [babelify]
	});
	return b.bundle()
	  .pipe(source( 'script.js' ))
	  .pipe(buffer())
	  .pipe(maps.init({ loadMaps: true }))
	  .pipe(maps.write( './' ))
	  .pipe(dest( './js/' ));
}

const minifyJS = () => {
	return src( 'js/script.js' )
		.pipe(uglify())
		.pipe(dest('js'));
}

const minifyImages = () => {
	return src( 'src/images/*' )
		.pipe(imagemin())
		.pipe(dest( 'images/' ));
}

const copyFonts = () => {
	return src( 'src/fonts/**' )
		.pipe( dest( './fonts' ) );
}

const watchFiles = () => {
	watch( 'src/scss/**/*.scss', compileCSS );
	watch( 'src/js/**/*.js', compileJS );
	watch( 'js/script.js' ).on( 'change', browserSync.reload );
	watch( 'src/images/*', minifyImages );
	watch( 'images/*' ).on( 'change', browserSync.reload );
	watch( 'src/fonts/*', copyFonts );
	watch( '**/*.php' ).on('change', browserSync.reload);
	console.log( '👀 Watching files 👀' );
}

exports.default = series( parallel( compileCSS, compileJS ), serveSite );
exports.build 	= series(
	parallel( compileCSS, compileJS ), 
	parallel( minifyCSS, minifyJS ),
	parallel( copyFonts, minifyImages )
);