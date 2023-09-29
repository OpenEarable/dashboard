$(document).ready(function() {
    const AUDIO_STATE = {
        IDLE: 0,
        PLAY: 1,
        PAUSE: 2,
        STOP: 3
    };

    // WAV file controls
    $("#buttonPlayWave").click(function() {
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
    });

    $("#buttonPauseWave").click(function() {
        log("Sending 'Pause' command.", "MESSAGE");
        try {
            openEarable.audioPlayer.wavFile(AUDIO_STATE.PAUSE);
        } catch (error) {
            log("Error occurred while trying to pause: " + error, "ERROR");
        }
    });

    $("#buttonStopWave").click(function() {
        log("Sending 'Stop' command.", "MESSAGE");
        try {
            openEarable.audioPlayer.wavFile(AUDIO_STATE.STOP);
        } catch (error) {
            log("Error occurred while trying to stop: " + error, "ERROR");
        }
    });

    // Jingle controls
    $("#buttonPlayJingle").click(function() {
        var jingleType = $('#jingleSelect').val();
        log("Sending 'Play' with jingle type '" + jingleType + "'.", "MESSAGE");
        try {
            openEarable.audioPlayer.jingle(AUDIO_STATE.PLAY, jingleType);
        } catch (error) {
            log("Error occurred while trying to play jingle: " + error, "ERROR");
        }
    });

    $("#buttonPauseJingle").click(function() {
        log("Sending 'Pause' command.", "MESSAGE");
        try {
            openEarable.audioPlayer.jingle(AUDIO_STATE.PAUSE, jingleType);
        } catch (error) {
            log("Error occurred while trying to pause jingle: " + error, "ERROR");
        }
    });

    $("#buttonStopJingle").click(function() {
        log("Sending 'Stop' command.", "MESSAGE");
        try {
            openEarable.audioPlayer.jingle(AUDIO_STATE.STOP, jingleType);
        } catch (error) {
            log("Error occurred while trying to stop jingle: " + error, "ERROR");
        }
    });

    // Frequency controls
    $("#buttonPlayFrequency").click(function() {
        var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
        var waveType = parseInt($('#waveTypeSelect').val());

        if (!frequencyValue) {
            log("Frequency value is not valid.", "ERROR");
            return;
        }

        log("Sending 'Play' with frequency value '" + frequencyValue + "' Hz and wave type '" + waveType + "'.", "MESSAGE");
        try {
            openEarable.audioPlayer.frequency(AUDIO_STATE.PLAY, waveType, frequencyValue);
        } catch (error) {
            log("Error occurred while trying to play frequency: " + error, "ERROR");
        }
    });

    $("#buttonPauseFrequency").click(function() {
        log("Sending 'Pause' command.", "MESSAGE");

        var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
        var waveType = parseInt($('#waveTypeSelect').val());

        try {
            openEarable.audioPlayer.frequency(AUDIO_STATE.PAUSE, waveType, frequencyValue);
        } catch (error) {
            log("Error occurred while trying to pause frequency: " + error, "ERROR");
        }
    });

    $("#buttonStopFrequency").click(function() {
        log("Sending 'Stop' command.", "MESSAGE");

        var frequencyValue = parseFloat($("#frequencyNumberSelector").val());
        var waveType = parseInt($('#waveTypeSelect').val());

        try {
            openEarable.audioPlayer.frequency(AUDIO_STATE.STOP, waveType, frequencyValue);
        } catch (error) {
            log("Error occurred while trying to stop frequency: " + error, "ERROR");
        }
    });
});