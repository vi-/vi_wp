<?php

global $vid_src;
global $vid_params;

if (!isset($vid_src)) {
	$vid_src = "https://player.vimeo.com/external/237675754.hd.mp4?s=617321c6cb5fee1650f7b8751c5ef0ab9146d6f7&profile_id=174";
}

if (!isset($vid_params)) {
	$vid_params = 'autoplay loop muted playsinline';
}

?>

<div class="flex-video-bg">
	<video <?php echo $vid_params; ?> src="<?php echo $vid_src; ?>"></video>
</div>