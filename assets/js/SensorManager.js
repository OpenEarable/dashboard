$(document).ready(function () {
    $('#setSensorConfigurationButton').on('click', function() {
        console.log("set sensor config")
        // Check if the checkbox for the first set of sensors is checked
        if ($('#areSensorsEnabled').is(':checked')) {
            var sensorSamplingRate = $('#sensorSamplingRate').val();
            log("Setting sampling rate for IMU: " + sensorSamplingRate + " Hz")
            openEarable.sensorManager.writeSensorConfig(0, sensorSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting IMU disabled.")
            openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        }

        if ($('#isPressureSensorEnabled').is(':checked')) {
            var pressureSensorSamplingRate = $('#pressureSensorSamplingRate').val();
            log("Setting sampling rate for pressure sensor: " + pressureSensorSamplingRate + " Hz")
            openEarable.sensorManager.writeSensorConfig(1, pressureSensorSamplingRate, 0);
        } else {
            log("Setting pressure sensor disabled.")
            openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        }

        // Check if the checkbox for the microphone is checked
        if ($('#isMicEnabled').is(':checked')) {
            var microphoneSamplingRate = $('#microphoneSamplingRate').val();
            log("Setting sampling rate for microphone: " + microphoneSamplingRate + " Hz")
            openEarable.sensorManager.writeSensorConfig(2, microphoneSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting microphone disabled.")
            openEarable.sensorManager.writeSensorConfig(2, 0, 0);
        }
    });

    $('.btn-disable-sensors').on('click', function() {
        // Set the sampling rate to 0 for all sensors
        openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        openEarable.sensorManager.writeSensorConfig(2, 0, 0);

        // Uncheck the checkboxes
        $('#areSensorsEnabled, #isMicEnabled').prop('checked', false);

        // Reset the dropdowns to 0
        $('#sensorSamplingRate, #microphoneSamplingRate').val('0');
    });
});
