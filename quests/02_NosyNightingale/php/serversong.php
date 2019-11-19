<?php
// https://quests.nonlinearmedia.org/share/serversong/serversong.php.txt
//
// Here's the high-level plan:
//   1. Receive an ordered list of patterns to match for each log line
//      via POST
//   2. Open the log file, and read the last N lines.
//   3. Translate each line into the index of the first of the given
//      patterns to match
//   4. Send back an array containing these indices (in corresponding
//      positions)
//
//
// WARNING - READ THIS - IMPORTANT
// If you install this app in your document root and it's publicly accessible
// keep in mind that someone who hits it can decipher the contents of
// whichever logfile you're exposing as a series of sounds.
//
main();

function main() {
    $log_file = "/var/log/messages";      // THIS IS THE SYSTEM LOG FILE. BEWARE!
    //$log_file = "/var/log/httpd/ssl_access_log";

    // The start/stop/dhcp patterns are for cs.psme.foothill.edu
    //$patterns_str = "dhcp\neth0\nsystem"; //// Use to debug locally
    $patterns_str = isset($_POST['p']) ? $_POST['p'] : "start\ndhcp\nstop\neth0\n";

    if ($patterns_str == "")
	return;

    $patterns_to_match = explode("\n", strtolower(trim($patterns_str)));
    if (sizeof($patterns_to_match) > 0) {
        if (strpos($patterns_to_match[0], "(or edit below first)"))
            array_shift($patterns_to_match);
    }

    $lines_str = shell_exec("/var/www/bin/{THIS-WOULD-BE-YOUR-MD5} $log_file");
    $lines = explode("\n", $lines_str);

    $out = array();
    // Play the lines in reverse order (most recent first.
    for ($i = sizeof($lines)-1; $i >= 0; $i--) {
	$line = strtolower($lines[$i]);
	for ($j = 0; $j < sizeof($patterns_to_match); $j++) {
            $pat = $patterns_to_match[$j];
            //print("looking for $pat in $line\n"); ////
	    if (strpos($line, $patterns_to_match[$j])) {
                //print("$line\n  matches\n  " . $patterns_to_match[$j] . "\n");
		array_push($out, $j);
	    }
        }
    }

    print(json_encode($out));
}

?>
