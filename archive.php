<?php

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main">

		<?php
		if ( have_posts() ) : ?>

			<header class="page-header">
				<div class="container">
					<div class="row">
						<?php
							the_archive_title( '<h1 class="page-title col">', '</h1>' );
							the_archive_description( '<div class="archive-description col">', '</div>' );
						?>
					</div>
				</div>
			</header><!-- .page-header -->
			
			<section class="blog-posts">
				<div class="container">
					<div class="row">
						<?php
						/* Start the Loop */
						while ( have_posts() ) : the_post();
							get_template_part( 'partials/content', get_post_format() );
						endwhile;
						the_posts_navigation(); ?>
					</div>
				</div>
			</section>

<?php
		else :

			get_template_part( 'partials/content', 'none' );

		endif; ?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php
get_footer();
