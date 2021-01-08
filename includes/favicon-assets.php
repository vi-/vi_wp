<?php 

namespace vi_wp\Theme;

add_action( 'wp_head', __NAMESPACE__ . '\add_favicons' );

function add_favicons() {
  echo '<link rel="icon" href="'.get_template_directory_uri().'/assets/images/favi/favicon.svg">';
  echo '<link rel="manifest" href="'.get_template_directory_uri().'/manifest.json">';
  echo '<link rel=”mask-icon” href=”'.get_template_directory_uri().'/assets/images/favi/mask-icon.svg” color=”#F5DF4D">';
  echo '<link rel="apple-touch-icon" href="'.get_template_directory_uri().'/assets/images/favi/apple-touch-icon.png">';
  echo '<meta name="theme-color" content="#F5DF4D">';
}