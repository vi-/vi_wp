/* ============================== 
	 Plugins / Polyfills
	 ============================== */

// Babel polyfill (for ie9 etc.)
require("babel-polyfill");
// Object-fit polyfill
const objectFitImages = require('object-fit-images');


/* ============================== 
	 My modules / components
	 ============================== */ 

// Navigation
const nav = require("./modules/navigation.js");


/* ============================== 
	 Execution code
	 ============================== */ 

objectFitImages();

const burger = document.querySelector('.nav-trigger');
burger.addEventListener( 'click', (e) => nav.toggleResponsiveMenu() );
