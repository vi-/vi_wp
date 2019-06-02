<?php get_header(); ?>
	<section class="error-404 text-center">
		<div class="container">
			<div class="message">
				<h1 class="huge">404</h1>
				<h3>Oops! That page can&rsquo;t be found.</h3>
				<p>It looks like nothing was found at this location. Maybe try one of the links below or a search?</p>
				<?php get_search_form(); ?>
			</div>
		</div>
	</section>
	<section class="recent-links text-center">
		<div class="container">
			<?php get_template_part( 'template-parts/recent-posts-list'); ?>
		</div>
	</section>
<?php
get_template_part( 'template-parts/pre-footer' );
get_footer();