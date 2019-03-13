<?php
global $p_blocks;

/**
 * Flexible fields
 */

if ( have_rows( 'flex' ) ):
  while ( have_rows( 'flex' ) ) : the_row();
    // NORMAL SECTION
    if( get_row_layout() == 'section' ):
      get_template_part( $p_blocks . '/_section' );
    endif;
  endwhile;
else:
	echo "<!-- Something went wrong, we could not find any flexible components for this layout. -->";
endif;