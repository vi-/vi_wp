<?php

namespace vi_wp\Theme;

add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_google_fonts' );

function enqueue_google_fonts() {
	wp_enqueue_style( 'vi_wp-google-fonts', 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap', [], '0.0.1' );
}