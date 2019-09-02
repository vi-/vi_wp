module.exports = {
	// Google Map set-up fucntions
	initMap : function( mapId, options, callback ) {
		if (!document.getElementById( mapId )) return;
		const defaults = {
			lat: -37.8145874,
			lng: 144.9684779,
			style : [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}],
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
		    url: '../assets/images/map_marker.png',
				size: new google.maps.Size( 28, 39 ),
				anchor: new google.maps.Point( 14, 39 ),
				scaledSize: new google.maps.Size( 28, 39 )
		};
		var map = new google.maps.Map(document.getElementById( mapId ), {
			zoom: 14,
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

	},

	// Handle loading of GMaps script
	loadScript : function(url, completeCallback) {
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
	},

	// Set up Maps
	setupGoogleMapsApi : function( mapsArray, options ) {
		const that = this;
		const mapEl = document.getElementById( mapsArray[0] );
		if ( mapEl ) {
			that.loadScript( 
				'https://maps.googleapis.com/maps/api/js?key=AIzaSyBbfBApLr--vuC2WatrGZtkdA5l-mV42pE', 
				function() { that.processMaps( mapsArray, options ) }
			);
		}
	},

	// Pan Map
	panMap : function( mapId, options ) {
		const that = this;
		that.initMap( mapId, options, function( map ) { map.panBy(0, 0) } )
	},

	// Process Maps
	processMaps : function( mapsArray, options ) {
		if ( !Array.isArray( mapsArray ) ) return console.error( 'Need to pass an array if Google Map IDs' );
		mapsArray.forEach( m => {
			this.panMap( m, options );
		});
	}
}