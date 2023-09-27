/* audio controls */
function onPlay() {
    var fileName = $('#fileNameInput').val();

    if (fileName === "") log("File name is empty. If a file is already playing, this command will stop the current audio.", type = "WARNING")
    else if (!fileName.endsWith('.wav')) log("File name is missing the '.wav' ending. Make sure its correct!", type = "WARNING")

    log("Sending 'Play' with file name '" + fileName + "'.", type = "MESSAGE");
}

function onPause() {
    log("Sending 'Pause'.", type = "MESSAGE")
}

function onStop() {
    log("Sending 'Stop'.", type = "MESSAGE")
}

