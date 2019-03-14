<?php

$p_blocks = 'template-parts/blocks';
$p_svg = 'template-parts/svg';

$colors = array(
  'transparent' => 'transparent',
  'white' 			=> '#FFFFFF',
  'black'				=> '#000000',
  'grey'				=> '#F2F2F2',
  'dark_grey'		=> '#4A4A4A',
  'brand_red'		=> '#EB1D24'
);

// Check if the color passed is one of the brand colors
// If it is, this will return the appropriate color Value
function color_in_array( $color ) {
	global $colors;
	if (array_key_exists($color, $colors)) {
		return $colors[$color];
	} else {
		return false;
	}
}

// Takes an Array of classes and combines into a string
function combine_classes( $classes ) {
	$result = '';
	foreach( $classes as $c ) {
		if (!empty($c)) { $result .= $c.' '; }
	}
	return $result;
}

// Util function to generate BG for ACF Flex blocks
function make_bg( $bg ) {
	$type = $bg['bg_type'];
	if ( $type === 'color' ) {
		$color = $bg['color'];
		return 'style="background-color: '.$color.'"';
	} else if ( $type === 'vid' ) {
		return $bg['video_src'];
	} else if ( $type === 'img' ) {
		if ( $bg['overlay'] === 'red' ) {
			return 'style="background: #E21E1A url('.wp_get_attachment_image_url( $bg['image'], 'large' ).')"';
		} else if ( $bg['overlay'] === 'black' ) {
			return 'style="background: rgba(0,0,0,.4) url('.wp_get_attachment_image_url( $bg['image'], 'large' ).')"';
		} else {
			return 'style="background-image: url('.wp_get_attachment_image_url( $bg['image'], 'large' ).')"';
		}
	} else if ( $type === 'pattern' ) {
		return null;
	}
}