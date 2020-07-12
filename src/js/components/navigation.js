const burger = document.querySelector('.hamburger');

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
	},

	closeNav : function() {
    document.body.classList.remove( 'nav-is-open' );
	}
}

const init = () => {
  burger.addEventListener( 'click', () => toggleResponsiveMenu() );
}

export default {
  init,
};