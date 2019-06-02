<?php get_header(); ?>
<div class="container">
	<h1>Front-page, this is your home...</h1>
</div>
<?php get_template_part( 'template-parts/acf_flex' ); ?>
<section class="video-hero">
	<?php 
		get_template_part( 'template-parts/blocks/_flex_video' );
	?>
</section>
<section class="columns">
	<div class="container">
		<div class="row">
			<div class="col-sm-6 col-lg-4">
				<p>This column will be 50% on small, and 33.3 on large</p>
			</div>
			<div class="col-sm-6 col-lg-4">
				<p>This column will be 50% on small, and 33.3 on large</p>
			</div>
			<div class="col-sm-6 col-lg-4">
				<p>This column will be 50% on small, and 33.3 on large</p>
			</div>
		</div>
	</div>
</section>
<section class="map">
	<div id="map" class="gmap"></div>
</section>
<?php get_footer(); ?>