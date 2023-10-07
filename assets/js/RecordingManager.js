const buttonIds = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9"];
$(document).ready(function () {
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

    function getCurrentlySelectedLabel() {
        let selectedButton = buttonIds.filter((btnId) => {
            return $("#" + btnId).css("border") === "3px solid rgb(119, 242, 161)" && btnId !== "btn9";
        });
        if (selectedButton.length) {
            return $("#" + selectedButton[0]).text();
        }
        return null;
    }

    let recordingActive = false;
    let recordingStartTime;
    let dataCache = {};

    function startRecording() {
        recordingStartTime = new Date().toISOString();
        recordingActive = true;

        if (!isLocked) { $('#lockButton').click() }

        $('#startRecordingButton').addClass("d-none");
        $('#stopRecordingButton').removeClass("d-none");

        $(".is-record-enabled").prop('disabled', true);
    }

    function stopRecording() {
        recordingActive = false;

        $('#startRecordingButton').removeClass("d-none");
        $('#stopRecordingButton').addClass("d-none");
        $(".is-record-enabled").prop('disabled', false);

        generateAndDownloadCSV(dataCache, recordingStartTime);
        dataCache = {};  // Reset data cache after download
    }

    openEarable.sensorManager.subscribeOnSensorDataReceived((sensorData) => {
        if (!recordingActive) return;

        if (!dataCache[sensorData.timestamp]) {
            // Initialize the cache entry for this timestamp
            dataCache[sensorData.timestamp] = {
                acc: [],
                gyro: [],
                mag: [],
                pressure: "",
                temperature: "",
                labels: []  // Storing the labels as an array to handle multiple labels
            };
        }

        let currentLabel = getCurrentlySelectedLabel();
        if (currentLabel && !dataCache[sensorData.timestamp].labels.includes(currentLabel)) {
            dataCache[sensorData.timestamp].labels.push(currentLabel);
        }

        switch (sensorData.sensorId) {
            case 0: // IMU data (Accelerometer, Gyroscope, Magnetometer)
                dataCache[sensorData.timestamp].acc = [-sensorData.ACC.X, sensorData.ACC.Z, sensorData.ACC.Y];
                dataCache[sensorData.timestamp].gyro = [-sensorData.GYRO.X, sensorData.GYRO.Z, sensorData.GYRO.Y];
                dataCache[sensorData.timestamp].mag = [-sensorData.MAG.X, sensorData.MAG.Z, sensorData.MAG.Y];
                break;

            case 1: // Pressure and Temperature
                dataCache[sensorData.timestamp].pressure = sensorData.BARO.Pressure;
                dataCache[sensorData.timestamp].temperature = sensorData.TEMP.Temperature;
                break;
        }
    });

    function generateAndDownloadCSV(dataCache, recordingStartTime) {
        let headers = [
            "time", "sensor_accX[m/s]", "sensor_accY[m/s]", "sensor_accZ[m/s]",
            "sensor_gyroX[°/s]", "sensor_gyroY[°/s]", "sensor_gyroZ[°/s]",
            "sensor_magX[µT]", "sensor_magY[µT]", "sensor_magZ[µT]",
            "sensor_pressure[hPa]", "sensor_temperature[°C]"
        ];

        for (let i = 0; i < buttonIds.length - 1; i++) {
            let buttonId = buttonIds[i];
            headers.push("label_OpenEarable_" + $('#' + buttonId).text());
        }

        let rows = [];

        // Sorting the timestamps and generating the CSV lines
        Object.keys(dataCache).sort().forEach(timestamp => {
            let data = dataCache[timestamp];
            let row = [timestamp];

            // Push sensor data ensuring the correct float format
            ["acc", "gyro", "mag"].forEach(sensorType => {
                if (data[sensorType] && data[sensorType].length === 3) {
                    row.push(...data[sensorType].map(val => val.toString().replace(',', '.')));
                } else {
                    row.push('', '', ''); // Push empty values if sensor data isn't available or isn't valid
                }
            });

            row.push(data.pressure ? data.pressure.toString().replace(',', '.') : '');
            row.push(data.temperature ? data.temperature.toString().replace(',', '.') : '');


            for (let i = 0; i < buttonIds.length - 1; i++) {
                let buttonId = buttonIds[i];
                let labelName = $('#' + buttonId).text();
                row.push(data.labels.includes(labelName) ? "x" : "");
            }

            rows.push(row);
        });

        // Check if any columns are empty across all rows and remove them
        for (let colIdx = headers.length - 1; colIdx >= 0; colIdx--) {
            if (rows.every(row => !row[colIdx])) {
                headers.splice(colIdx, 1);
                rows.forEach(row => row.splice(colIdx, 1));
            }
        }

        // Construct the CSV content
        let csv = headers.join(",") + "\n" + rows.map(row => row.join(",")).join("\n");

        // Trigger a download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `recording_${recordingStartTime}.csv`); // filename based on when the recording was started
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }


});
