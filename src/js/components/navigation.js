module.exports = {
	toggleResponsiveMenu : function() {
		const burger = document.querySelector('.hamburger');
		if (burger.classList.contains('is-active')) {
			this.floatingNav.closeNav();
		} else {
			this.floatingNav.openNav();
		}
		console.log('toggling nav now...');
	},

	floatingNav : {
		siteHeader 	: document.querySelector('.site-header'),
		topBar 			: document.querySelector('.top-bar'),
		burger 			: document.querySelector('.hamburger'),
		nav 				: document.querySelector('.main-navigation'),

		openNav : function() {
			this.burger.classList.add('is-active');
			this.nav.classList.add('is-open');
			this.topBar.classList.add('is-active');
		},


		closeNav : function() {
			this.burger.classList.remove('is-active');
			this.nav.classList.remove('is-open');
			this.topBar.classList.remove('is-active');
		}
	}
}