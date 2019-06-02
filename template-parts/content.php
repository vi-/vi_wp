<?php
/**
 * Template part for displaying posts (Single Post & in Blog)
 */
?>


<?php if ( is_singular() ): ?>

<article class="single-post">
	<?php the_title('<h2 class="entry-title container">', '</h2>'); ?>
	<div class="post-content container">
		<?php the_content(); ?>
	</div>
</article>

<?php else: ?>

<article class="post-extract col-md-6 col-lg-4">
	<a href="<?php the_permalink(); ?>" class="link-wrap">
		<header class="posts-header">
			<?php the_title('<h2 class="entry-title">', '</h2>'); ?>
			<span class="date"><?php echo get_the_date('l d F Y'); ?></span>
		</header>
		
		<div class="contents">
			<?php echo '<p>'.wp_trim_words( get_the_content(), 35 ).'</p>'; ?>
		</div>
	</a>
	<div class="categories"><?php the_category(' '); ?></div>
</article>

<?php endif; ?>