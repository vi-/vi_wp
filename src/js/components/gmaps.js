// Google Map set-up fucntions
const initMap = function( mapId, options, callback ) {
	if (!document.getElementById( mapId )) return;
	const defaults = {
		lat: Number(-37.84124),
		lng: Number(144.938421),
		zoom : 14
	};
	if (!options) options = defaults;

	let location = {
		lat: Number(document.getElementById( mapId ).dataset.lat), 
		lng: Number(document.getElementById( mapId ).dataset.lng)
	};
	if ( !location.lat || !location.lng ) {
		location.lat = defaults.lat;
		location.lng = defaults.lng;
		console.warn( 'GMaps element did not have valid "data-lat" or "data-lng" attributes set, using default values...' );
	}
	var icon = {
			url: options.icon.img || `${WP.templateUrl}/assets/images/marker.png`,
			size: new google.maps.Size( 28, 39 ),
			anchor: new google.maps.Point( 14, 39 ),
			scaledSize: new google.maps.Size( 28, 39 )
	};
	var svgIcon = {
		path: 'M10,26 C3.33333333,19.0152317 0,13.6818983 0,10 C0,4.4771525 4.4771525,0 10,0 C15.5228475,0 20,4.4771525 20,10 C20,13.6818983 16.6666667,19.0152317 10,26 Z M10,14 C12.209139,14 14,12.209139 14,10 C14,7.790861 12.209139,6 10,6 C7.790861,6 6,7.790861 6,10 C6,12.209139 7.790861,14 10,14 Z',
		fillColor: '#fa0000',
		anchor: new google.maps.Point( 10, 26 ),
		fillOpacity: 1,
		strokeWeight: 0,
		scale: 1
	};
	var map = new google.maps.Map(document.getElementById( mapId ), {
		zoom: options.zoom || defaults.zoom,
		zoomControl: 				false,
		mapTypeControl: 		false,
		scaleControl: 			false,
		streetViewControl: 	false,
		rotateControl: 			false,
		fullscreenControl: 	false,
		center: location,
		styles: options.style || defaults.style
	});
	
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		icon: icon
	});
	callback( map );
}

// Handle loading of GMaps script
const loadScript = function(url, completeCallback) {
	var script = document.createElement('script'), done = false,
			head = document.getElementsByTagName("head")[0];
	script.src = url;
	script.onload = script.onreadystatechange = function(){
		if ( !done && (!this.readyState ||
				this.readyState == "loaded" || this.readyState == "complete") ) {
			done = true;
			if (completeCallback) completeCallback();
			// IE memory leak
			script.onload = script.onreadystatechange = null;
			head.removeChild( script );
		}
	};
	head.appendChild(script);
}

// Set up Maps
const setupGoogleMapsApi = function( mapsArray, options ) {
	const mapEl = document.getElementById( mapsArray[0] );
	if ( mapEl ) {
		loadScript( 
			'https://maps.googleapis.com/maps/api/js?key=AIzaSyBbfBApLr--vuC2WatrGZtkdA5l-mV42pE', 
			function() { processMaps( mapsArray, options ) }
		);
	}
}

// Pan Map
const panMap = function( mapId, options ) {
	initMap( mapId, options, function( map ) { map.panBy(0, 0) } )
}

// Process Maps
const processMaps = function( mapsArray, options ) {
	if ( !Array.isArray( mapsArray ) ) return console.error( 'Need to pass an array if Google Map IDs' );
	mapsArray.forEach( m => {
		panMap( m, options );
	});
}

module.exports = { 
	setupGoogleMapsApi 
}