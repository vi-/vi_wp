<?php 
	$args = array(
		'numberposts' => 5,
		'offset'			=> 0,
		'orderby'			=> 'post_date',
		'order'				=> 'DESC',
		'post_type'		=> 'portfolio',
		'post_status' => 'publish'
	);
	$recent_works = wp_get_recent_posts($args);
?>
<div class="posts-wrap">
	<div class="recent-posts">
		<?php
			the_widget( 'WP_Widget_Recent_Posts', 
				array( 	'title' 	=> __('Recent posts'),
								'number' => 5
				)
			);
		?>
	</div>
</div>