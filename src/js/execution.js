let nav = require("./definitions.js");

const burger = document.querySelector('.nav-trigger');
burger.addEventListener( 'click', (e) => nav.toggleResponsiveMenu() );
