// Google Map set-up fucntions
function initMap( mapId, options, callback ) {
  if ( !document.getElementById( mapId ) ) return;
  const defaults = {
    lat: Number( -37.84124 ),
    lng: Number( 144.938421 ),
    zoom: 14,
  };
  // eslint-disable-next-line no-param-reassign
  if ( !options ) options = defaults;

  const location = {
    lat: Number( document.getElementById( mapId ).dataset.lat ),
    lng: Number( document.getElementById( mapId ).dataset.lng ),
  };
  if ( !location.lat || !location.lng ) {
    location.lat = defaults.lat;
    location.lng = defaults.lng;
    // eslint-disable-next-line no-console
    console.warn( 'GMaps element did not have valid "data-lat" or "data-lng" attributes set, using default values...' );
  }
  const icon = {
    // eslint-disable-next-line no-undef
    url: options.icon.img || `${WP.templateUrl}/assets/images/marker.png`,
    // eslint-disable-next-line no-undef
    size: new google.maps.Size( 28, 39 ),
    // eslint-disable-next-line no-undef
    anchor: new google.maps.Point( 14, 39 ),
    // eslint-disable-next-line no-undef
    scaledSize: new google.maps.Size( 28, 39 ),
  };

  // eslint-disable-next-line no-undef
  const map = new google.maps.Map( document.getElementById( mapId ), {
    zoom: options.zoom || defaults.zoom,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    center: location,
    styles: options.style || defaults.style,
  } );

  // eslint-disable-next-line
  const marker = new google.maps.Marker({
    position: location,
    map,
    icon,
  } );
  callback( map );
}

// Handle loading of GMaps script
function loadScript( url, completeCallback ) {
  const script = document.createElement( 'script' ); let done = false;
  const head = document.getElementsByTagName( 'head' )[0];
  script.src = url;
  // eslint-disable-next-line no-multi-assign
  script.onload = script.onreadystatechange = function injectScript() {
    if ( !done && ( !this.readyState
        || this.readyState === 'loaded' || this.readyState === 'complete' ) ) {
      done = true;
      if ( completeCallback ) completeCallback();
      // IE memory leak
      // eslint-disable-next-line no-multi-assign
      script.onload = script.onreadystatechange = null;
      head.removeChild( script );
    }
  };
  head.appendChild( script );
}

// Pan Map
function panMap( mapId, options ) {
  initMap( mapId, options, ( map ) => { map.panBy( 0, 0 ); } );
}

// Process Maps
function processMaps( mapsArray, options ) {
  // eslint-disable-next-line no-console
  if ( !Array.isArray( mapsArray ) ) return console.error( 'Need to pass an array if Google Map IDs' );
  mapsArray.forEach( ( m ) => {
    panMap( m, options );
  } );
  return true;
}

// Set up Maps
function setupGoogleMapsApi( mapsArray, options ) {
  const mapEl = document.getElementById( mapsArray[0] );
  if ( mapEl ) {
    loadScript(
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyBbfBApLr--vuC2WatrGZtkdA5l-mV42pE',
      () => { processMaps( mapsArray, options ); },
    );
  }
}

module.exports = {
  setupGoogleMapsApi,
};
