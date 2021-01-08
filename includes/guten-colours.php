<?php

namespace vi_wp\Theme;

add_action( 'after_setup_theme', __NAMESPACE__ . '\color_pallete' );

function color_pallete() {
	add_theme_support(
		'editor-color-palette',
		[
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
		]
	);
}