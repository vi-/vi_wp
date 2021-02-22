import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

const burger = document.querySelector( '.hamburger' );
const navTarget = document.querySelector( '.main-navigation' );

const floatingNav = {
  openNav: function openNav() {
    document.body.classList.add( 'nav-is-open' );
    disableBodyScroll( navTarget );
  },

  closeNav: function closeNav() {
    document.body.classList.remove( 'nav-is-open' );
    enableBodyScroll( navTarget );
  },
};

const toggleResponsiveMenu = () => {
  const IS_NAV_OPEN = document.body.classList.contains( 'nav-is-open' );
  if ( IS_NAV_OPEN ) {
    floatingNav.closeNav();
  } else {
    floatingNav.openNav();
  }
};

const init = () => {
  burger.addEventListener( 'click', () => toggleResponsiveMenu() );
};

export default {
  init,
};
