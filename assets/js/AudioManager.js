$(document).ready(function() {
    const AUDIO_STATE = {
        IDLE: 0,
        PLAY: 1,
        PAUSE: 2,
        STOP: 3
    };
    function getSelectedAudioType() {
        if ($("#file").is(":checked")) {
            return "file";
        } else if ($("#jingle").is(":checked")) {
            return "jingle";
        } else if ($("#frequency").is(":checked")) {
            return "frequency";
        }
        return null;
    }

    $('#button-set-source').click(function() {
        let audioType = getSelectedAudioType();
    
        if (audioType === "file") {
            // WAV file set logic
            var fileName = $('#fileNameInput').val();
    
            if (fileName === "") {
                log("File name is empty.", "WARNING");
            } else if (!fileName.endsWith('.wav')) {
                log("File name is missing the '.wav' ending. Make sure it's correct!", "ERROR");
                return;
            }
    
            log("Setting source with file name '" + fileName + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.wavFile(fileName);
            } catch (error) {
                log("Error occurred while trying to set source: " + error, "ERROR");
            }
    
        } else if (audioType === "jingle") {
            // Jingle play logic
            var jingleType = $('#jingleSelect').val();
            log("Setting source jingle type '" + jingleType + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.jingle(jingleType);
            } catch (error) {
                log("Error occurred while trying to set jingle source: " + error, "ERROR");
            }
    
        } else if (audioType === "frequency") {
            // Frequency set logic
            var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
            var loudnessValue = parseFloat($("#loudnessInput").val()) / 100;
            var waveType = parseInt($('#waveTypeSelect').val());
    
            if (!frequencyValue) {
                log("Frequency value is not valid.", "ERROR");
                return;
            }
    
            log("Setting source with frequency value '" + frequencyValue + "' Hz, wave type '" + waveType + "', and loudness '" + loudnessValue + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.frequency(waveType, frequencyValue, loudnessValue);
            } catch (error) {
                log("Error occurred while trying to set frequency source: " + error, "ERROR");
            }
        }
    });
    
    $("#button-play-audio").click(function() {
        log("Sending audio 'Play' command.", "MESSAGE");
        openEarable.audioPlayer.setState(AUDIO_STATE.PLAY);
    });
    
    $("#button-pause-audio").click(function() {
        log("Sending audio 'Stop' command.", "MESSAGE");
        openEarable.audioPlayer.setState(AUDIO_STATE.PAUSE);
    });
    
    $("#button-stop-audio").click(function() {
        log("Sending audio 'Stop' command.", "MESSAGE");
        openEarable.audioPlayer.setState(AUDIO_STATE.STOP);
    });
});