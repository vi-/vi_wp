<?php
/**
 * The template for displaying all pages
 */
get_header(); ?>

			<div class="grumpy">
				<img src="<?php echo get_template_directory_uri(); ?>/images/grumpy.jpg"/>
			</div>
			<?php
			while ( have_posts() ) : the_post();

				get_template_part( 'template-parts/content', 'page' );

				// If comments are open or we have at least one comment, load up the comment template.
				if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif;

			endwhile;

get_sidebar();
get_footer();
