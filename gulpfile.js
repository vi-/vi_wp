'use strict';

const { series, parallel, src, dest, watch } = require( 'gulp' );

const	uglify				= require('gulp-uglify'),
			sass					= require('gulp-sass'),
			postcss 			= require('gulp-postcss'),
			rename 				= require('gulp-rename'),
			autoprefixer 	= require('autoprefixer'),
			cssnano				= require('cssnano'),
			atImport 			= require('postcss-import'),
			browserSync		= require('browser-sync').create(),
			imagemin			= require('gulp-imagemin'),
			rollup 				= require('rollup'),
			resolve 			= require('rollup-plugin-node-resolve'),
			commonjs 			= require('rollup-plugin-commonjs'),
			babel 				= require('rollup-plugin-babel'),
			source				= require('vinyl-source-stream'),
			buffer				= require('vinyl-buffer'),
			maps					= require('gulp-sourcemaps');

const isProduction = process.env.NODE_ENV === 'production';

const paths = {
	base: './src/',
	dest: './',
	scripts: {
		src: './src/js/**/*.js',
		dest: './js/',
		entry: './src/js/myscript.js',
		exit: './js/script.js'
	}
}

const config = {
	rollup: {
		bundle: {
			input: paths.scripts.entry,
			plugins: [
				resolve( {
					jsnext: true,
					main: true,
					browser: true,
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

// const runRollup = () => {
// 	return rollup({
// 		input: './src/js/myscript.js',
// 		sourcemap: true,
// 		format: 'iife',
// 		plugins: [
// 			resolve({ mainFields: ['module', 'main'] }),
// 			commonjs({
// 				include: 'node_modules/**'
// 			}),
// 			babel({
// 				presets: ["@babel/preset-env"],
//         exclude: 'node_modules/**'
// 			})
// 		]
// 	}).on( 'error', ( err ) => console.log( err.message ))
// 	.pipe( source( 'myscript.js', './src/js' ) )
// 	.pipe( buffer() )
// 	.pipe( maps.init( { loadMaps: true } ) )
// 	.pipe( rename( 'script.js' ) )
// 	.pipe( maps.write( '.' ) )
// 	.pipe( dest( './js' ) );
// 	console.log( 'rollup ran...' )
// }

async function compileJS() {
	// runRollup();
	// done();
	const bundle = await rollup.rollup( config.rollup.bundle );
	await bundle.write( config.rollup.write );
}

const serveSite = ( cb ) => {
	browserSync.init({
		proxy: "wpstarter.test"
	});
	minifyImages();
	watchFiles();
}

const compileCSS = () => {
	return src(['src/scss/style.scss', 'src/scss/editor.scss' ] )
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
		.pipe(dest( 'css' ))
		.pipe(browserSync.stream());
}

const minifyCSS = () => {
	return src( 'css/*.css' )
		.pipe(cssnano())
		.pipe(dest( 'css' ));
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

const browserReload = ( done ) => {
	browserSync.reload();
	done();
}

const watchFiles = () => {
	watch( 'src/scss/**/*.scss', compileCSS );
	watch( 'src/js/**/*.js', series( compileJS, minifyJS, browserReload ) );
	watch( 'src/images/*', series( minifyImages, browserReload ) );
  watch( 'src/fonts/*', copyFonts );
  watch( '**/*.php', browserReload );
	console.log( '👀 Watching files 👀' );
}

exports.default = series( parallel( compileCSS, compileJS ), minifyJS, serveSite );
exports.build 	= series(
	parallel( compileCSS, compileJS ), 
	parallel( minifyCSS, minifyJS ),
	parallel( copyFonts, minifyImages )
);