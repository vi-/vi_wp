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
const nav 	= require("./modules/navigation.js"),
			gmaps = require("./modules/gmaps.js");

/* ============================== 
	 Execution code
	 ============================== */ 


// Google MAP
const mapEl = document.getElementById("map");

if (mapEl) {
	gmaps.loadScript( 
		'https://maps.googleapis.com/maps/api/js?key=AIzaSyBbfBApLr--vuC2WatrGZtkdA5l-mV42pE', 
		function() { panMap(); }
	);
	window.addEventListener( 'resize', panMap );
}

function panMap() {
	if (window.innerWidth < 768 ) {
		gmaps.initMap( function( map ) { map.panBy(0, 0) } )
	} else {
		if (document.body.classList.contains('home')) {
			gmaps.initMap( function( map ) { map.panBy(-300, 0) } )
		} else {
			gmaps.initMap( function( map ) { map.panBy(-200, 200) } )	
		}
	}
}

objectFitImages();

const burger = document.querySelector('.nav-trigger');
burger.addEventListener( 'click', (e) => nav.toggleResponsiveMenu() );
