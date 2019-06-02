<?php
get_header();

if ( have_posts() ) :
	if ( is_home() && ! is_front_page() ) : ?>
		<header>
			<h1 class="page-title screen-reader-text"><?php single_post_title(); ?></h1>
		</header>
	<?php endif; ?>

	<div class="blog-posts">
		<div class="container">
			<div class="row">
				<?php 
					while ( have_posts() ) : the_post();
						get_template_part( 'template-parts/content', get_post_format() );
					endwhile;
					the_posts_navigation(); 
				?>
			</div>
		</div>
	</div>
	<?php 
else :
	get_template_part( 'template-parts/content', 'none' );
endif; 

get_sidebar();
get_footer();
