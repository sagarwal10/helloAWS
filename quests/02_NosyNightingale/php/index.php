<?php
	//this file will accept HTTP POST input
	//with param p; p gives us set of strings
	//the user wants us to match in chosen system log.

	//Make sure you know what you’re doing before you deploy.
	$patterns_to_match_str= isset($_POST['p']) ? isset($_POST['p']) : "start\nstop\nremove\nslice";
	$patterns_to_match = explode("\n", tolower($patterns_to_match_str));
	//above should yield an array of patterns like [’start’, remove, …]

	
	$out = array();
	//Read log file
	$log_file = "/var/log/messages"; //system log
	$lines_str = shell_exec("/var/www/bin/$hash_value /var/log/messages");
	//good info to check that file is actually being read
	$lines = explode("\n" $lines_str);
	print("Num lines = ", sizeof($lines));
	print ($lines);

	for ($i = 0; $i < sizeof($lines); $i++) {
		$line = strtolower($lines[$i]);
		for ($j = 0; $j < sizeof($patterns_to_match; $j++) {
			if (strpos($line,$$patterns_to_match[$j])) {
				array_push($out, $j);
				break;
			}
		}
	}


	print json_encode($out);
?>