	</main>
	<footer class="site-footer">
		<div class="container">
			<div class="row">
				<div class="col-md-6">
					<?php
						wp_nav_menu( array(
							'theme_location' => 'footer-menu',
							'menu_id'        => 'footer-menu',
						));
					?>
					<p>Copyright &copy; <?php echo date('Y'); ?></p>
				</div>
				<div class="col-md-6">
					<ul class="social">
						<li><?php get_template_part('template-parts/svg/_facebook'); ?></li>
						<li><?php get_template_part('template-parts/svg/_insta'); ?></li>
						<li><?php get_template_part('template-parts/svg/_twitter'); ?></li>
					</ul>
				</div>
			</div>
		</div>
	</footer>
<?php wp_footer(); ?>
</body>
</html>
