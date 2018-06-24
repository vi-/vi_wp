<?php get_header(); ?>

<section class="blog-posts">
<?php 
	while ( have_posts() ) : the_post();
		get_template_part( 'template-parts/content' );
	endwhile;
?>
</section>

<?php 
get_sidebar();
get_footer();
