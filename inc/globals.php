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
function make_bg( $bg, $part, $classes ) {
  $type = $bg['bg_type'];
  
  /**
   * PROCESS COLOR BGs
   */
	if ( $type === 'color' ) {
    $color = $bg['color'];
    if ( $part === 'start' ) {
      return '<section class="'.$classes.' "style="background-color: '.$color.'">';
    } else if ( $part === 'end' ) {
      return '</section>';
    }
	/**
   * PROCESS VIDEO BGs
   */
	} else if ( $type === 'vid' ) {
    return $bg['video_src'];
  /**
   * PROCESS IMAGE BGs
   */
	} else if ( $type === 'img' ) {
    if ( $part === 'end' ) return '</section>';
    $section_start = '<section class="'.$classes.'" ';
    $overlay_props = 'background-size: cover; '. 
                     'background-position: center center; '.
                     'background-blend-mode: luminosity;';
    
      if ( $bg['overlay'] === 'red' ) {
        return $section_start.'style="background: #E21E1A url('.wp_get_attachment_image_url( $bg['image'], 'large' ).'); '.$overlay_props.' " >';
      } else if ( $bg['overlay'] === 'black' ) {
        return $section_start.'style="background: rgba(0,0,0,.4) url('.wp_get_attachment_image_url( $bg['image'], 'large' ).'); '.$overlay_props.' ">';
      } else {
        return $section_start.'style="background-image: url('.wp_get_attachment_image_url( $bg['image'], 'large' ).')">';
      }
	} else if ( $type === 'pattern' ) {
		return null;
	}
}