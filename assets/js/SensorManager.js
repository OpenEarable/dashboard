$(document).ready(function () {
    $('.sampling-rate-input').on('change', function() {
        // Get the checkbox for the corresponding row
        var checkbox = $(this).parent().prev().prev().find('input[type="checkbox"]');
        
        // Check if selected value is not 0
        if ($(this).val() != '0') {
            checkbox.prop('checked', true);
        } else {
            checkbox.prop('checked', false);
        }
    });    

    $('#setSensorConfigurationButton').on('click', async function() {
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

        // Check if the checkbox for the microphone is checked
        if ($('#isPPGEnabled').is(':checked')) {
            var ppgSamplingRate = $('#ppgSamplingRate').val();
            log("Setting sampling rate for PPG sensor: " + ppgSamplingRate + " Hz")
            // TODO
            // await openEarable.sensorManager.writeSensorConfig(?, ppgSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting PPG sensor disabled.")
            // TODO
            // await openEarable.sensorManager.writeSensorConfig(?, 0, 0);
        }
    });

    $('.btn-disable-sensors').on('click', async function() {
        // Set the sampling rate to 0 for all sensors
        await openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(2, 0, 0);
        //await openEarable.sensorManager.writeSensorConfig(?, 0, 0); PPG Sensor

        // Uncheck the checkboxes
        $('#areSensorsEnabled, #isMicEnabled, #isPressureSensorEnabled, #isPPGEnabled').prop('checked', false);

        // Reset the dropdowns to 0
        $('#sensorSamplingRate, #microphoneSamplingRate, #pressureSensorSamplingRate, #ppgSamplingRate').val('0');
    });
});
