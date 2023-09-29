/* logging */
function log(message, type = "MESSAGE") {
    var typeColorMap = {
        "ERROR": "#f27777",
        "WARNING": "#e0f277",
        "SUCCESS": "#77F2A1",
        "MESSAGE": "#aaa",
    }

    $("#log").prepend(`<div style="color: ${typeColorMap[type]}"><b>${(new Date().toISOString().replace('T', ' ').substring(0, 23))} - ${type}:</b> <span style="color: white;">${message}</span></div>`)
}

function onClearLog() {
    $('#log').empty();
}