<?php get_header(); ?>
<h1>This is your homepage son. <br>Here, have a video...</h1>
<section class="video_hero">
	<?php 
		get_template_part( 'template-parts/blocks/_flex_video' );
	?>
</section>
<section class="map">
	<div id="map" class="gmap"></div>
</section>
<?php get_footer(); ?>