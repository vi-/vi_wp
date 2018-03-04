<?php get_header(); ?>
		<section class="error-404">
				<div class="message">
					<h1 class="huge">404</h1>
					<h3>Oops! That page can&rsquo;t be found.</h3>
					<p>It looks like nothing was found at this location. Maybe try one of the links below or a search?</p>
					<?php get_search_form(); ?>
				</div>
		</section>
		<section class="recent-links">
			<?php get_template_part( 'template-parts/recent-posts-list'); ?>
		</section>
<?php
get_template_part( 'template-parts/pre-footer' );
get_footer();