// External Plugins & Polyfills
const objectFitImages = require('object-fit-images');

// If using flickity, uncomment the requires
// const Flickity = require('flickity');
// require('flickity-imagesloaded');

// My Components
const nav 	= require("./components/navigation.js"),
			gmaps = require("./components/gmaps.js");


/* ============================================================
	 Execution code
	 ============================================================ */

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

const std_sliders = [...document.querySelectorAll('.standard-slider')];

if ( std_sliders ) {
	std_sliders.forEach( ( s ) => {
		const slider = new Flickity( s, {
			cellAlign: 'left',
			wrapAround: true,
			imagesLoaded: true,
			watchCSS: true,
			contain: true
		});
	});
}
