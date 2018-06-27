// Object-fit polyfill
const objectFitImages = require('object-fit-images');

const nav = require("./modules/navigation.js");

objectFitImages();

const burger = document.querySelector('.nav-trigger');
burger.addEventListener( 'click', (e) => nav.toggleResponsiveMenu() );
