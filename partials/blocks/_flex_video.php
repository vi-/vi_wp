<?php

global $vid_src;
global $vid_params;

if (!isset($vid_src)) {
	$vid_src = "https://player.vimeo.com/external/282975264.sd.mp4?s=e0e25cca3d18d7391d279cd759e4812708d556dd&profile_id=165";
}

if (!isset($vid_params)) {
	$vid_params = 'autoplay loop muted playsinline';
}

?>

<div class="flex-video-bg">
	<video <?php echo $vid_params; ?> src="<?php echo $vid_src; ?>"></video>
</div>