<?php

$advanced_visible = get_sub_field( 'show_advanced_settings' );

if ( $advanced_visible ) {
  $adv = get_sub_field( 'advanced_settings' );
  $padding = ( $adv[ 'show_padding_options' ] ) ? $adv[ 'padding' ] : null;
  $custom_classes = ( $adv[ 'add_custom_classes' ] ) ? $adv[ 'custom_classes' ] : null;
}