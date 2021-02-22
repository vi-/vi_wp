// imports for WebPack
import '../styles/style.scss';
import './dev/helpers';
// External Plugins & Polyfills
import objectFitImages from 'object-fit-images';
// If using flickity, uncomment the requires
import Flickity from 'flickity';
import 'flickity-imagesloaded';
// My Components
import Nav from './components/navigation';
import Maps from './components/gmaps';
import snazzyMap from './components/snazzymap';

require.context( '../images', true );
require.context( '../fonts', true );

/* ============================================================
  Execution code
  ============================================================ */

Maps.setupGoogleMapsApi( ['map'], {
  style: snazzyMap,
  zoom: 18,
  icon: {
    /* global WP */
    img: `${WP.templateUrl}/assets/images/marker_alt.png`,
  },
} );

objectFitImages();

Nav.init();

const stdSliders = [...document.querySelectorAll( '.standard-slider' )];

if ( stdSliders ) {
  stdSliders.forEach( ( s ) => {
    const slider = new Flickity( s, {
      cellAlign: 'left',
      wrapAround: true,
      imagesLoaded: true,
      watchCSS: true,
      contain: true,
    } );
    return slider;
  } );
}
