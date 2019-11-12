// &: 10/9/19
// Overview of what we're doing:
//  1. Present the user with a text window in which they can enter
//     server log patterns, one per line.
//  2. Send this data as an array of strings (one elem per line)
//     the the remote server (php).
//  3. The php script will look at the last N lines of the actual
//     access_log, and send back a series of numbers encoding the
//     first patterns in the list that match each line (-1 for no match)
//  4. When the results return, we fill in the SS_notes_left_to_play
//     array and invoke ss_play(), which will play the notes one by
//     one until the notes are exhausted.
//

// TODO: We're using a couple of configurable globals for now. Figure out how
// to factor them in later.
var SS_beat_duration = 0.50; // sec
var SS_notes_left_to_play;

function ss_start() {
    var pats = $('#ss_patterns_input').val();
    if (typeof pats === 'undefined' || pats === "") {
        console.log('Nothing in the patterns box');
        return;
    }

    data = { 'p' : pats };
    $.post('php/serversong.php', data, function(res) {
        SS_notes_left_to_play = JSON.parse(res);
        if (typeof SS_notes_left_to_play === 'undefined')
            return;
        ss_play_notes_in_queue(); // Will empty SS_notes_to_play
    });
}

// SS_notes_left_to_play is an array of numbers. These numbers are
// the indices of the first of our patterns to match each line
// (note - all unmatched lines would have been eaten).
// We translate that into audio by playing the (n % 6)th note
// (cuz we only have 6 notes)
//
// Infinite-cycle through the beats in the beat_str until all returned
// notes have been exhausted. If a bit is 0, we skip setting a
// play for that beat. Else we schedule the next note in the returned
// array for playing and go on to the next beat.
//        
function ss_play_notes_in_queue() {
    if (SS_notes_left_to_play.length == 0) {
        this.beat_counter = 0;
        // Schedule (don't call) restart
        console.log('next song in 2s');
        setTimeout(ss_start, 2000);
        return;
    }
    
    if (typeof this.beat_counter == 'undefined')
        this.beat_counter = 0;

    ss_play_drum_beat(this.beat_counter);
    var beat_str = $('#ss_beats_selector').val().replace(/ /g, "");

    
    var beat = beat_str[this.beat_counter % beat_str.length];
    ++this.beat_counter;
    
    if (beat != "0") {
        var note_to_play = SS_notes_left_to_play.shift();

        // If you move this function outside the loop, users can't change
        // the raga at run-time (if you provide control)
        var available_sounds = ss_get_sounds_from_current_scale();
        
        var sound_id = available_sounds[note_to_play % available_sounds.length];
        var sound_file = 'aud/' + sound_id + '.mp3';
        ss_play(sound_file);
    }
    setTimeout(ss_play_notes_in_queue, SS_beat_duration * 1000);
}

// Return an array of sound names determined by the scale of
// the named raga. By default, return sankarabaranam (cmaj)
//
function ss_get_sounds_from_current_scale() {
    var scale_str = $('#ss_scale_selector').val();

    if (scale_str == 'hindolam') {
        return [ 'sa2', 'ga2', 'ma2', 'da2', 'ni2', 'sa3' ];
    } else if (scale_str == 'sivaranjani') { // hindustani version 
        return [ 'sa2', 'ri2', 'gu2', 'pa2', 'da2', 'sa3' ];
    } else if (scale_str == 'mohanam') { 
        return [ 'sa2', 'ri2', 'ga2', 'pa2', 'da2', 'sa3' ];
    } else if (scale_str == 'malahari') { 
        return [ 'sa2', 'ru2', 'ga2', 'ma2', 'pa2', 'du2', 'sa3' ];
    } else {
        return [ 'sa2', 'ri2', 'ga2', 'ma2', 'pa2', 'da2', 'ni2', 'sa3' ];
    }
}

// Play the note
function ss_play(sound_file) {
    console.log('playing ' + sound_file); ////
    var aud = new Audio(sound_file);
    if (!aud) {
        console.log("Couldn't open " + sound_file);
        return;
    }
    
    aud.load(); // for safari and ios
    var promise = aud.play();
    if (promise !== undefined) {
        promise.then(_ => {}).catch(_ => {
                console.log('ss_play(' + sound_file + ') failed');
        });
    }
}

// Play one of our drum beats (dum1... dum7) selected by
// cycling through the selected drum_beat_seq string
// You can surface this to the user too.
function ss_play_drum_beat(beat_count) {
    var drum_beat_seq_str = "3010102000";

    var drum_beat = drum_beat_seq_str[beat_count % drum_beat_seq_str.length];
    if (drum_beat != "0")
        ss_play('aud/dums/dum' + drum_beat + '.mp3');
}

$(document).ready(function() {
    $(document.body).fadeIn();
    });
