$(document).ready(function () {
    $('#setSensorConfigurationButton').on('click', async function() {
        console.log("set sensor config")
        // Check if the checkbox for the first set of sensors is checked
        if ($('#areSensorsEnabled').is(':checked')) {
            var sensorSamplingRate = $('#sensorSamplingRate').val();
            log("Setting sampling rate for IMU: " + sensorSamplingRate + " Hz")
            await openEarable.sensorManager.writeSensorConfig(0, sensorSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting IMU disabled.")
            await openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        }

        if ($('#isPressureSensorEnabled').is(':checked')) {
            var pressureSensorSamplingRate = $('#pressureSensorSamplingRate').val();
            log("Setting sampling rate for pressure sensor: " + pressureSensorSamplingRate + " Hz")
            await openEarable.sensorManager.writeSensorConfig(1, pressureSensorSamplingRate, 0);
        } else {
            log("Setting pressure sensor disabled.")
            await openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        }

        // Check if the checkbox for the microphone is checked
        if ($('#isMicEnabled').is(':checked')) {
            var microphoneSamplingRate = $('#microphoneSamplingRate').val();
            log("Setting sampling rate for microphone: " + microphoneSamplingRate + " Hz")
            await openEarable.sensorManager.writeSensorConfig(2, microphoneSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting microphone disabled.")
            await openEarable.sensorManager.writeSensorConfig(2, 0, 0);
        }
    });

    $('.btn-disable-sensors').on('click', async function() {
        // Set the sampling rate to 0 for all sensors
        await openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(2, 0, 0);

        // Uncheck the checkboxes
        $('#areSensorsEnabled, #isMicEnabled, #isPressureSensorEnabled').prop('checked', false);

        // Reset the dropdowns to 0
        $('#sensorSamplingRate, #microphoneSamplingRate, #pressureSensorSamplingRate').val('0');
    });
});
