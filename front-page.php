<?php get_header(); ?>
<h1>Front-page, this is your home...</h1>
<?php get_template_part( 'template-parts/acf_flex' ); ?>
<section class="video-hero">
	<?php 
		get_template_part( 'template-parts/blocks/_flex_video' );
	?>
</section>
<section class="map">
	<div id="map" class="gmap"></div>
</section>
<?php get_footer(); ?>