$(document).ready(function () {
    $('.sampling-rate-input').on('change', function() {

        var selects = $('.sampling-rate-input');
        var changedElem = $(this);
        var changedIndex = selects.index(changedElem);
        var neighborIndex = changedIndex % 2 === 0 ? changedIndex + 1 : changedIndex - 1;
    
        var checkbox = $(this).closest('.grid-row').find('input[type="checkbox"]');
    
        if (neighborIndex >= 0 && neighborIndex < selects.length) {
            var neighborElem = selects.eq(neighborIndex);
            if (changedElem.val() !== '0') {
                changedElem.removeClass('fake-disabled-select');
                neighborElem.addClass('fake-disabled-select').val('0');
                checkbox.prop('checked', true);
            } else {
                neighborElem.removeClass('fake-disabled-select');
                checkbox.prop('checked', false);
            }
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

        // Check if the checkbox for the left microphone is checked
        if ($('#isMicEnabled').is(':checked')) {
            var microphoneSamplingRate = $('#microphone1SamplingRate').val();
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
        $('#sensorSamplingRate, #microphone1SamplingRate, #pressureSensorSamplingRate, #ppgSamplingRate').val('0');
    });
});
