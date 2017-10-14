<?php

/**
 * https://gist.github.com/moorscode/b04e648200c844bf3f6d
 * wp_register_script wrapper with local fallback
 *
 * @param            $handle
 * @param            $src
 * @param            $js_test   JavaScript code to test for availability of object
 * @param bool|false $local_src Load source file if test fails
 * @param array      $deps
 * @param bool|false $ver
 * @param bool|false $in_footer
 */
function wp_register_script_local_fallback( $handle, $src, $js_test, $local_src = false, $deps = array(), $ver = false, $in_footer = false ) {
	wp_register_script( $handle, $src, $deps, $ver, $in_footer );
	script_local_fallback::register_fallback( $handle, $src, $js_test, $local_src );
}

/**
 * wp_enqueue_script wrapper with local fallback
 *
 * @param            $handle
 * @param            $src
 * @param            $js_test   JavaScript code to test for availability of object
 * @param bool|false $local_src Load source file if test fails
 * @param array      $deps
 * @param bool|false $ver
 * @param bool|false $in_footer
 */
function wp_enqueue_script_local_fallback( $handle, $src, $js_test, $local_src = false, $deps = array(), $ver = false, $in_footer = false ) {
	wp_enqueue_script( $handle, $src, $deps, $ver, $in_footer );
	script_local_fallback::register_fallback( $handle, $src, $js_test, $local_src );
}

/**
 * wp_deregister_script wrapper for cleaning up local fallback
 *
 * @param $handle
 */
function wp_deregister_script_local_fallback( $handle ) {
	wp_deregister_script( $handle );
	script_local_fallback::deregister_fallback( $handle );
}

class script_local_fallback {
	private static $fallbacks = [ ];
	private static $registered_hook = false;

	/**
	 * Registers a local fallback for a handle
	 *
	 * @param            $handle
	 * @param            $src
	 * @param            $js_test
	 * @param bool|false $local_src
	 */
	public static function register_fallback( $handle, $src, $js_test, $local_src = false ) {
		/**
		 * uses get_stylesheet_directory_uri instead of get_template_uri for child-theme support
		 */
		$local_src = empty( $local_src ) ? get_stylesheet_directory_uri() . '/js/' . basename( $src ) : $local_src;

		self::$fallbacks[ $handle ] = array(
			'test'  => $js_test,
			'local' => $local_src
		);

		if ( ! self::$registered_hook ) {
			add_action( 'script_loader_tag', 'script_local_fallback::script_loader_tag', 10, 3 );
			self::$registered_hook = true;
		}
	}

	/**
	 * Clean up registered fallback
	 *
	 * @param $handle
	 */
	public static function deregister_fallback( $handle ) {
		unset( self::$fallbacks[ $handle ] );
	}

	/**
	 * Add additional local fallback code to script tag
	 *
	 * @param $tag
	 * @param $handle
	 * @param $src
	 *
	 * @return string
	 */
	public static function script_loader_tag( $tag, $handle, $src ) {
		if ( isset( self::$fallbacks[ $handle ] ) ) {
			$data = self::$fallbacks[ $handle ];

			$tag .= <<<EO_SCRIPT
<script type="text/javascript">{$data['test']} || document.write('<script src="{$data['local']}"><\/script>');</script>
EO_SCRIPT;

		}

		return $tag;
	}
}