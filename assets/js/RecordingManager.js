const buttonIds = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9"];
$(document).ready(function () {
    $('#stopRecordingButton').hide();

    let isLocked = true;

    function resetLabelButtons() {
        buttonIds.forEach((btnId) => {
            $("#" + btnId).css("border", "3px solid transparent");;
            $("#" + btnId).css("font-weight", "normal");
        });

        // If another button is in edit mode, reset it
        let editingButton = $(".in-edit-mode");
            if (editingButton.length) {
            let originalText = editingButton.find('.btn-edit-input').val();
            editingButton.text(originalText).removeClass("in-edit-mode");
        }
    }

    function setLabelButtons() {
        resetLabelButtons();
        $("#btn9").css("border", "3px solid #77F2A1");
        $("#btn9").css("font-weight", "bold");
    }

    setLabelButtons();

    buttonIds.forEach(function (btnId) {
        $("#" + btnId).click(function (e) {
            e.stopPropagation();

            if (btnId === "btn9") return;

            if (isLocked) {
                buttonIds.forEach(function (id) {
                    $("#" + id).css("border", "3px solid transparent");
                    $("#" + id).css("font-weight", "normal");
                });

                // Add green border to clicked button
                $(this).css("border", "3px solid #77F2A1");
                $(this).css("font-weight", "bold");
                return;
            }

            let currentButton = $(this);

            // If another button is in edit mode, reset it
            let editingButton = $(".in-edit-mode");
            if (editingButton.length) {
                let originalText = editingButton.find('.btn-edit-input').val();
                editingButton.text(originalText).removeClass("in-edit-mode");
            }

            let currentText = currentButton.text();

            // Create an input field and a confirm button
            let inputField = $("<input type='text' class='btn-edit-input' value='" + currentText + "'>");
            let confirmButton = $("<button class='btn btn-small btn-confirm'>✓</button>");
            let combined = $(`<div class="d-flex flex-row"></div>`);
            combined.append(inputField);
            combined.append(confirmButton);

            // Add the confirm button functionality
            confirmButton.click(function (e) {
                e.stopPropagation();
                currentButton.text(inputField.val());
                log("Changed label to '" + inputField.val() + "'.");
                currentButton.removeClass("in-edit-mode");
            });

            currentButton.text("").append(combined).addClass("in-edit-mode");
            inputField.focus();

            
        });
    });

    $("#lockButton").click(function () {
        isLocked = !isLocked;

        if (isLocked) {
            $(this).html('<i class="bi bi-lock"></i>');
            $(this).addClass("btn-stop");
            $(this).removeClass("btn-play");
            setLabelButtons();
        } else {
            $(this).html('<i class="bi bi-unlock"></i>');
            $(this).removeClass("btn-stop");
            $(this).addClass("btn-play");
            resetLabelButtons();

            $("#btn1").click();
        }
    });

    $('#startRecordingButton').click(() => { startRecording() });
    $('#stopRecordingButton').click(() => { stopRecording() });

    var csv = "";
    function startRecording() {
        if (!isLocked) { $('#lockButton').click() }

        $('#startRecordingButton').hide();
        $('#stopRecordingButton').show();

        csv += "time,sensor_accX[g],sensor_accY[g],sensor_accZ[g],sensor_gyroX[°/s],sensor_gyroY[°/s]," + 
        "sensor_gyroZ[°/s],sensor_magX[µT],sensor_magY[µT],sensor_magZ[µT],sensor_pressure[hPa],sensor_temperature[°C]"

        csv += buttonIds.map((buttonId) => {
            return "labeling_OpenEarable_" + $('#' + buttonId).text();
        });

        console.log(csv)

        $(".is-record-enabled").prop('disabled', true);
    }

    function stopRecording() {
        $('#startRecordingButton').show();
        $('#stopRecordingButton').hide();

        $(".is-record-enabled").prop('disabled', false);
    }
});
