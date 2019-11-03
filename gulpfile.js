'use strict';

const { series, parallel, src, dest, watch } = require( 'gulp' );

const	sass					= require('gulp-sass'),
			postcss 			= require('gulp-postcss'),
			autoprefixer 	= require('autoprefixer'),
			cssnano				= require('cssnano'),
			atImport 			= require('postcss-import'),
			browserSync		= require('browser-sync').create(),
			imagemin			= require('gulp-imagemin'),
			rollup 				= require('rollup'),
			resolve 			= require('rollup-plugin-node-resolve'),
			commonjs 			= require('rollup-plugin-commonjs'),
			babel 				= require('rollup-plugin-babel'),
			uglify				= require('rollup-plugin-uglify'),
			source				= require('vinyl-source-stream'),
			buffer				= require('vinyl-buffer'),
			maps					= require('gulp-sourcemaps');

const isProduction = process.env.NODE_ENV === 'production';

const basePaths = {
	src: './src/',
	dest: './'
}
const paths = {
	scripts: {
		src: 		`${basePaths.src}js/**/*.js`,
		dest: 	`${basePaths.dest}js/`,
		entry: 	`${basePaths.src}js/myscript.js`,
		exit: 	`${basePaths.dest}js/script.js`
	},
	styles: {
		entry: 	`${basePaths.src}scss/style.scss`,
		editor: `${basePaths.src}scss/editor.scss`,
		dest: 	`${basePaths.dest}css/`
	}
}

const config = {
	rollup: {
		bundle: {
			input: paths.scripts.entry,
			plugins: [
				resolve( {
					mainFields: [ 'module', 'jsnext:main', 'main'  ]
				} ),
				commonjs(),
				babel( {
					exclude: 'node_modules/**',
				} ),
			],
		},
		write: {
			file: paths.scripts.exit,
			format: 'iife',
			globals: {
				jquery: 'jQuery',
			},
			sourcemap: isProduction ? true : 'inline',
		},
	}
}

// Modify build process for Production
if ( isProduction ) config.rollup.bundle.plugins.push( uglify.uglify() );

async function compileJS() {
	const bundle = await rollup.rollup( config.rollup.bundle );
	await bundle.write( config.rollup.write );
}

const serveSite = ( cb ) => {
	browserSync.init({ proxy: "wpstarter.test" });
	watchFiles();
}

const compileCSS = () => {
	return src([ paths.styles.entry, paths.styles.editor ] )
		.pipe( maps.init() )
		.pipe( sass().on( 'error', function(err) {
			console.error( err.message );
			browserSync.notify( err.message, 3000 );
			this.emit( 'end' );
		}))
		.pipe(postcss([
      autoprefixer(),
      atImport(),
      cssnano()
    ]))
		.pipe(maps.write( './' ))
		.pipe(dest( paths.styles.dest ))
		.pipe(browserSync.stream());
}

const minifyCSS = () => {
	return src( 'css/*.css' )
		.pipe(cssnano())
		.pipe(dest( 'css' ));
}

const minifyImages = () => {
	return src( `${basePaths.src}/images/*` )
		.pipe(imagemin())
		.pipe(dest( `${basePaths.dest}images/` ));
}

const copyFonts = () => {
	return src( 'src/fonts/**' )
		.pipe( dest( './fonts' ) );
}

const browserReload = ( done ) => {
	browserSync.reload();
	done();
}

const watchFiles = () => {
	watch( 'src/scss/**/*.scss', compileCSS );
	watch( 'src/js/**/*.js', series( compileJS, browserReload ) );
	watch( 'src/images/*', series( minifyImages, browserReload ) );
  watch( 'src/fonts/*', copyFonts );
  watch( '**/*.php', browserReload );
	console.log( '👀 Watching files 👀' );
}

exports.default = series( parallel( compileCSS, compileJS, minifyImages ), serveSite );
exports.build 	= series(
	parallel( compileCSS, compileJS ), 
	parallel( minifyCSS ),
	parallel( copyFonts, minifyImages )
);