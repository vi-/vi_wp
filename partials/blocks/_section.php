<?php 
global $p_blocks;
require_once( get_template_directory() . '/partials/acf_generic_fields.php' );

$content = get_sub_field( 'content' ); 

$classes = combine_classes( array(
  'block',
  'section',
  $padding,
  $custom_classes,
  ($bg['bg_type']) ? 'bg_'.$bg['bg_type'] : null,
  ($bg['reverse_type']) ? 'reverse' : null
));

echo make_bg( $bg, 'start', $classes ); ?>
  <div class="wrapper content">
    <?php echo $content; ?>
  </div>
<?php
echo make_bg( $bg, 'end', $classes ); ?>