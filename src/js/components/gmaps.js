module.exports = {
	// Google Map set-up fucntions
	initMap : function( callback ) {
		const location = {
			lat: -38.0362265, 
			lng: 145.34233789999996
		};
		var icon = {
		    path: "M18.5,52 C6.16666667,36.4781786 0,25.3115119 0,18.5 C0,8.28273213 8.28273213,0 18.5,0 C28.7172679,0 37,8.28273213 37,18.5 C37,25.3115119 30.8333333,36.4781786 18.5,52 Z M17.5073399,20.6530593 L19.4919392,20.6530593 C19.9324006,21.5347448 20.5761518,22.2425464 21.4239138,22.776464 C22.2716757,23.3118246 23.2023396,23.5787834 24.2151845,23.5787834 C25.6684907,23.5787834 26.91274,23.0614605 27.9472115,22.0275363 C28.9816829,20.9936121 29.5,19.7497284 29.5,18.2980498 C29.5,16.8341055 28.9816829,15.5851712 27.9472115,14.5519686 C26.91274,13.5180444 25.6684907,13 24.2151845,13 C23.2023396,13 22.2716757,13.2662373 21.4239138,13.7972688 C20.5761518,14.3290219 19.9324006,15.0324944 19.4919392,15.9098509 L17.5073399,15.9098509 C17.0675994,15.0324944 16.4224064,14.3290219 15.5753654,13.7972688 C14.7276034,13.2662373 13.7969395,13 12.7840946,13 C11.3307884,13 10.0865391,13.5180444 9.05206763,14.5519686 C8.01687529,15.5851712 7.5,16.8341055 7.5,18.2980498 C7.5,19.7497284 8.01687529,20.9936121 9.05206763,22.0275363 C10.0865391,23.0614605 11.3307884,23.5787834 12.7840946,23.5787834 C13.7969395,23.5787834 14.7276034,23.3118246 15.5753654,22.776464 C16.4224064,22.2425464 17.0675994,21.5347448 17.5073399,20.6530593 Z M10.4635625,20.5123648 C9.84936759,19.896195 9.54299102,19.1559255 9.54299102,18.2893917 C9.54299102,17.4228579 9.84936759,16.6825883 10.4635625,16.0671401 C11.0784783,15.4524134 11.8181073,15.1457715 12.6838915,15.1457715 C13.5503965,15.1457715 14.2893047,15.4524134 14.9049413,16.0671401 C15.2538502,16.4163511 15.5047185,16.8081311 15.6589881,17.2410373 L21.0786093,17.2410373 C21.232879,16.8081311 21.4837473,16.4163511 21.8326561,16.0671401 C22.4475719,15.4524134 23.187201,15.1457715 24.0529851,15.1457715 C24.9194901,15.1457715 25.6583983,15.4524134 26.274035,16.0671401 C26.8882299,16.6825883 27.1946065,17.4228579 27.1946065,18.2893917 C27.1946065,19.1559255 26.8882299,19.896195 26.274035,20.5123648 C25.6583983,21.1270915 24.9194901,21.4337334 24.0529851,21.4337334 C23.187201,21.4337334 22.4475719,21.1270915 21.8326561,20.5123648 C21.4837473,20.1624323 21.232879,19.7706522 21.0786093,19.3377461 L15.6589881,19.3377461 C15.5047185,19.7706522 15.2538502,20.1624323 14.9049413,20.5123648 C14.2893047,21.1270915 13.5503965,21.4337334 12.6838915,21.4337334 C11.8181073,21.4337334 11.0784783,21.1270915 10.4635625,20.5123648 Z",
		    fillColor: '#372D2B',
		    fillOpacity: 1,
		    anchor: new google.maps.Point(30,70),
		    strokeWeight: 0,
		    scale: 1
		};
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			zoomControl: 				false,
			mapTypeControl: 		false,
			scaleControl: 			false,
			streetViewControl: 	false,
			rotateControl: 			false,
			fullscreenControl: 	false,
			center: location,
			styles: [{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.text","stylers":[{"visibility":"on"},{"weight":"1"}]},{"featureType":"administrative.country","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative.province","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"poi.attraction","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.government","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]
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
	}
}