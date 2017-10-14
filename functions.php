<?php

if ( ! function_exists( 'vi_starter_setup' ) ) :
	function vi_starter_setup() {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );

		register_nav_menus( array(
			'menu-1' => esc_html__( 'Primary', 'vi_starter' ),
		) );

		add_theme_support( 'html5', array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
		) );
	}
endif;
add_action( 'after_setup_theme', 'vi_starter_setup' );

/**
 * Remove EMOJI code from the head
 */

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/**
 * Loads augmented script loader (for CDN w. Local Fallback)
 */
require get_template_directory() . '/inc/script_cdn_fallback.php';

/**
 * Enqueue scripts and styles.
 */
function vi_starter_scripts() {
	wp_enqueue_style( 'vi_starter-style', get_template_directory_uri() . '/css/style.css' );

	// jQuery via CDN with fallback to local version
	// Debugging Scripts
	$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
	$jquery_version = wp_scripts()->registered['jquery']->ver;
	wp_deregister_script('jquery');

	wp_enqueue_script_local_fallback(
		'jquery',
		'https://ajax.googleapis.com/ajax/libs/jquery/' . $jquery_version . "/jquery{$suffix}.js",
		'window.jQuery',
		includes_url('/js/jquery/jquery.js'),
		array(),
		false,
		true
	);

	// Combined JS file
	wp_enqueue_script( 'main_script', get_template_directory_uri() . '/js/script.min.js', array(), '', true );

	// Threaded comments Ajaxified reply
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	// Get Rid of Embed Script.
	wp_deregister_script( 'wp-embed' );
}
add_action( 'wp_enqueue_scripts', 'vi_starter_scripts' );