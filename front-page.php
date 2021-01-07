<?php get_header(); ?>
<section class="container">
	<h1>Front-page, this is your home...</h1>
</section>
<?php get_template_part( 'partials/acf_flex' ); ?>
<section class="video-hero">
	<?php 
		get_template_part( 'partials/blocks/_flex_video' );
	?>
</section>
<section class="component-slider md-up-container">
		<div class="standard-slider md-up-row">
			<div class="slide">
				<div class="img-wrap">
					<img src="https://picsum.photos/id/10/500/400" alt="">
				</div>
				<div class="slide-text">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio debitis consequatur voluptatum?</div>
			</div>
			<div class="slide">
				<div class="img-wrap">
					<img src="https://picsum.photos/id/20/500/400" alt="">
				</div>
				<div class="slide-text">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio debitis consequatur voluptatum?</div>
			</div>
			<div class="slide">
				<div class="img-wrap">
					<img src="https://picsum.photos/id/30/500/400" alt="">
				</div>
				<div class="slide-text">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio debitis consequatur voluptatum?</div>
			</div>
			<div class="slide">
				<div class="img-wrap">
					<img src="https://picsum.photos/id/40/500/400" alt="">
				</div>
				<div class="slide-text">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio debitis consequatur voluptatum?</div>
			</div>
			<div class="slide">
				<div class="img-wrap">
					<img src="https://picsum.photos/id/50/500/400" alt="">
				</div>
				<div class="slide-text">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio debitis consequatur voluptatum?</div>
			</div>
		</div>
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
	<div id="map" class="gmap" data-lat="" data-lng=""></div>
</section>
<?php get_footer(); ?>