<?php 
global $p_blocks;
require_once( get_template_directory() . '/template-parts/acf_generic_fields.php' );

$content = get_sub_field( 'content' ); 

$classes = combine_classes( array(
  'block',
  $padding,
  $custom_classes,
  'yeah_baby',
  ($bg['reverse_type']) ? 'reverse' : null
));

?>

<section class="<?php echo $classes; ?>" <?php echo make_bg( $bg ); ?>>
  <?php echo $content; ?>
</section>