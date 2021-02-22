<?php

namespace vi_wp\Theme;

add_action( 'after_setup_theme', __NAMESPACE__ . '\color_pallete' );

$colourFile = __DIR__ . '/global-colours.php';

if (file_exists( $colourFile )) {
  require_once $colourFile;
}

if (!isset($globalColours)) {
  $globalColours = [
    [
      'name'  => 'Black',
      'slug'  => 'black',
      'color' => '#000000',
    ],
    [
      'name'  => 'White',
      'slug'  => 'white',
      'color' => '#FFFFFF',
    ],
    [
      'name'  => 'Red',
      'slug'  => 'red',
      'color' => '#FA0000',
    ],
	];
}

function color_pallete() {
  global $globalColours;
	add_theme_support(
		'editor-color-palette',
		$globalColours
	);
}