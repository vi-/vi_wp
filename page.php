<?php

get_header();
	while ( have_posts() ) : the_post();
		get_template_part( 'partials/content', 'page' );
	endwhile;

get_footer();
