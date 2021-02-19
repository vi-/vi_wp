<?php

namespace vi_wp\Theme;

if (function_exists('acf_add_options_page')): 
  acf_add_options_page(array(
    'page_title' 	=> 'vi_wp Settings',
    'menu_title'	=> 'vi_wp Settings',
    'menu_slug' 	=> 'vi_wp-settings',
    'capability'	=> 'edit_posts',
    'redirect'		=> false
  ));
endif;
