<?php

if ( ! function_exists( 'vi_starter_setup' ) ) :
	function vi_starter_setup() {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_editor_style( 'css/editor.css' );

		register_nav_menus( array(
			'primary' => esc_html__( 'Primary', 'vi_starter' ),
			'footer-menu'	=> esc_html__( 'Footer', 'vi_starter' )
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

// Custom colors for Tiny MCE
function my_mce4_options($init) {
 
		$custom_colors = '
				"00A79D", "Green pine",
				"372D2B", "Chocolate",
				"D8D8D8", "Light grey",
				"000000", "Black",
				"ffffff", "white"
		';
 
		// build color grid default+custom colors
		$init['textcolor_map'] = '['.$custom_colors.']';
		// 8 swatches per row
		$init['textcolor_rows'] = 1;
		return $init;
}
add_filter('tiny_mce_before_init', 'my_mce4_options');

// Remove EMOJI code from the head
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

// Enqueue scripts and styles.
function vi_starter_scripts() {
	wp_enqueue_style( 'google-fonts', 'https://fonts.googleapis.com/css?family=Work+Sans:400,500,700', false );
	wp_enqueue_style( 'vi_starter-style', get_template_directory_uri() . '/assets/css/app.min.css' );

	wp_enqueue_script( 'main_script', get_template_directory_uri() . '/assets/js/app.min.js', array('jquery'), '', true );
	// Get Rid of Embed Script.
	wp_deregister_script( 'wp-embed' );

	// Makes available to JS
	$WordPress_JS_Object = array( 
			'templateUrl' 	=> get_stylesheet_directory_uri() // For images etc...
		);
	wp_localize_script( 'main_script', 'WP', $WordPress_JS_Object );
}
add_action( 'wp_enqueue_scripts', 'vi_starter_scripts' );

require get_template_directory() . '/inc/template-tags.php';
require get_template_directory() . '/inc/globals.php';
