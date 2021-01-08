<?php

namespace vi_wp\Theme;

require_once  __DIR__ . '/includes/globals.php';
require_once  __DIR__ . '/includes/acf-options.php';
require_once  __DIR__ . '/includes/acf-blocks.php';
require_once  __DIR__ . '/includes/google-fonts.php';
require_once  __DIR__ . '/includes/guten-colours.php';
require_once  __DIR__ . '/includes/favicon-assets.php';
require_once  __DIR__ . '/includes/template-tags.php';


add_action( 'after_setup_theme',  __NAMESPACE__ . '\\vi_wp_setup' );
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets' );

remove_action( 'wp_head',         __NAMESPACE__ . '\\print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', __NAMESPACE__ . '\\print_emoji_styles' );

function vi_wp_setup() {
  add_theme_support( 'title-tag' );
  add_theme_support( 'post-thumbnails' );
  add_theme_support( 'align-wide' );
  add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ] );
  add_editor_style( 'assets/css/editor.css' );

  register_nav_menus( array(
    'primary' => esc_html__( 'Primary', 'vi_wp' ),
    'footer-menu'	=> esc_html__( 'Footer', 'vi_wp' )
  ) );

  add_image_size( 'hero', 2000, 0, true );
}

// Enqueue scripts and styles.
function enqueue_assets() {
	wp_enqueue_style( 'vi_wp-style', get_template_directory_uri() . '/assets/css/app.min.css', [], '0.0.1' );
	wp_enqueue_script( 'vi_wp-script', get_template_directory_uri() . '/assets/js/app.min.js', ['jquery'], '0.0.1', true);
	wp_localize_script( 'vi_wp-script', 'WP', [ 'templateUrl' => get_stylesheet_directory_uri() ] );
}
