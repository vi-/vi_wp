<?php

namespace vi_wp\Theme;

add_filter( 'block_categories', __NAMESPACE__ . '\vi_wp_blocks', 10, 2 );
add_action( 'acf/init', __NAMESPACE__ . '\init_blocks' );

/**
 * Register custom block category.
 *
 * @param array $categories default block categories.
 */
function vi_wp_blocks( $categories ) {
	return array_merge(
		$categories,
		[
			[
				'slug'  => 'vi_wp-blocks',
				'title' => __( 'The vi_wp Blocks', 'ACF Gutenberg Blocks' ),
			],
		]
	);
}

/**
 * Register ACF Gutenberg blocks.
 */
function init_blocks() {

	acf_register_block(
		[
			'name'            => 'vi_wp-hero-block',
			'title'           => __( 'Hero Block' ),
			'description'     => __( 'Main hero block' ),
			'render_template' => '/partials/blocks/acf/_hero.php',
			'category'        => 'vi_wp-blocks',
			'icon'            => 'images-alt2',
			'keywords'        => [ 'Hero' ],
			'mode'            => 'edit',
			'align'           => 'full',
      'supports'        => [
				'align' => array( 'full' ),
			],
		]
	);
}