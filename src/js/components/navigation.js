import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
const burger = document.querySelector('.hamburger');
const nav_target = document.querySelector('.main-navigation');

const toggleResponsiveMenu = () => {
  const IS_NAV_OPEN = document.body.classList.contains( 'nav-is-open' );
	if ( IS_NAV_OPEN ) {
		floatingNav.closeNav();
	} else {
		floatingNav.openNav();
	}
}

const floatingNav = {

	openNav : function() {
    document.body.classList.add( 'nav-is-open' );
    disableBodyScroll( nav_target );
	},

	closeNav : function() {
    document.body.classList.remove( 'nav-is-open' );
    enableBodyScroll( nav_target );
	}
}

const init = () => {
  burger.addEventListener( 'click', () => toggleResponsiveMenu() );
  let x = [ 'one', 'two', 'three' ]
  let y = [ 1, 2, 3 ]
  console.log( [...x, ...y, 'pooooop'] )
}

export default {
  init,
};