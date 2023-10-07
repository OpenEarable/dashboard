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
    
    $("#button-play-audio").click(function() {
        let audioType = getSelectedAudioType();
    
        if (audioType === "file") {
            // WAV file play logic
            var fileName = $('#fileNameInput').val();
    
            if (fileName === "") {
                log("File name is empty. If a file is already playing, this command will stop the current audio.", "WARNING");
            } else if (!fileName.endsWith('.wav')) {
                log("File name is missing the '.wav' ending. Make sure it's correct!", "ERROR");
                return;
            }
    
            log("Sending 'Play' with file name '" + fileName + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.wavFile(AUDIO_STATE.PLAY, fileName);
            } catch (error) {
                log("Error occurred while trying to play: " + error, "ERROR");
            }
    
        } else if (audioType === "jingle") {
            // Jingle play logic
            var jingleType = $('#jingleSelect').val();
            log("Sending 'Play' with jingle type '" + jingleType + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.jingle(AUDIO_STATE.PLAY, jingleType);
            } catch (error) {
                log("Error occurred while trying to play jingle: " + error, "ERROR");
            }
    
        } else if (audioType === "frequency") {
            // Frequency play logic
            var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
            var loudnessValue = parseFloat($("#loudnessInput").val()) / 100;
            var waveType = parseInt($('#waveTypeSelect').val());
    
            if (!frequencyValue) {
                log("Frequency value is not valid.", "ERROR");
                return;
            }
    
            log("Sending 'Play' with frequency value '" + frequencyValue + "' Hz, wave type '" + waveType + "', and loudness '" + loudnessValue + "'.", "MESSAGE");
            try {
                openEarable.audioPlayer.frequency(AUDIO_STATE.PLAY, waveType, frequencyValue, loudnessValue);
            } catch (error) {
                log("Error occurred while trying to play frequency: " + error, "ERROR");
            }
        }
    });
    
    $("#button-pause-audio").click(function() {
        let audioType = getSelectedAudioType();
        
    
        if (audioType === "file") {
            var fileName = $('#fileNameInput').val();
            // WAV file pause logic
            log("Sending 'Pause' command.", "MESSAGE");
            try {
                openEarable.audioPlayer.wavFile(AUDIO_STATE.PAUSE, fileName);
            } catch (error) {
                log("Error occurred while trying to pause: " + error, "ERROR");
            }
    
        } else if (audioType === "jingle") {
            // Jingle pause logic
            var jingleType = $('#jingleSelect').val();
            log("Sending 'Pause' command.", "MESSAGE");
            try {
                openEarable.audioPlayer.jingle(AUDIO_STATE.PAUSE, jingleType);
            } catch (error) {
                log("Error occurred while trying to pause jingle: " + error, "ERROR");
            }
    
        } else if (audioType === "frequency") {
            // Frequency pause logic
            log("Sending 'Pause' command.", "MESSAGE");
    
            var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
            var waveType = parseInt($('#waveTypeSelect').val());
            var loudnessValue = parseFloat($("#loudnessInput").val()) / 100;
    
            try {
                openEarable.audioPlayer.frequency(AUDIO_STATE.PAUSE, waveType, frequencyValue, loudnessValue);
            } catch (error) {
                log("Error occurred while trying to pause frequency: " + error, "ERROR");
            }
        }
    });
    
    $("#button-stop-audio").click(function() {
        let audioType = getSelectedAudioType();
        if (audioType === "file") {
            var fileName = $('#fileNameInput').val();
        
            // WAV file stop logic
            log("Sending 'Stop' command.", "MESSAGE");

            try {
                openEarable.audioPlayer.wavFile(AUDIO_STATE.STOP, fileName);
            } catch (error) {
                log("Error occurred while trying to stop: " + error, "ERROR");
            }
    
        } else if (audioType === "jingle") {
            // Jingle stop logic
            var jingleType = $('#jingleSelect').val();
    
            log("Sending 'Stop' command.", "MESSAGE");
            try {
                openEarable.audioPlayer.jingle(AUDIO_STATE.STOP, jingleType);
            } catch (error) {
                log("Error occurred while trying to stop jingle: " + error, "ERROR");
            }
    
        } else if (audioType === "frequency") {
            // Frequency stop logic
            log("Sending 'Stop' command.", "MESSAGE");
    
            var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
            var waveType = parseInt($('#waveTypeSelect').val());
            var loudnessValue = parseFloat($("#loudnessInput").val()) / 100;
    
            try {
                openEarable.audioPlayer.frequency(AUDIO_STATE.STOP, waveType, frequencyValue, loudnessValue);
            } catch (error) {
                log("Error occurred while trying to stop frequency: " + error, "ERROR");
            }
        }
    });
});