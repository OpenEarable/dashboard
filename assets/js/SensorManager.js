$(document).ready(function () {
    $('.sampling-rate-input').on('change', function () {
        // Get the checkbox for the corresponding row
        var checkbox = $(this).parent().prev().prev().find('input[type="checkbox"]');

        // Check if selected value is not 0
        if ($(this).val() != '0') {
            checkbox.prop('checked', true);
        } else {
            checkbox.prop('checked', false);
        }
    });

    $('#setSensorConfigurationButton').on('click', async function () {
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
            log("Setting sampling rate for microphone: " + microphoneSamplingRate + " Hz");
            if (openEarable.firmwareVersion === "1.4.0") {
                // set gain negative to disable mic
                var gainInner = -1;
                var gainOuter = -1;
                if ($('#innerMicrophoneEnabled').is(':checked')) {
                    gainInner = $('#microphoneGainInner').val()
                }
                if ($('#outerMicrophoneEnabled').is(':checked')) {
                    gainOuter = $('#microphoneGainOuter').val()
                }

                // Ensure gain values are in the range of int8 (-128 to 127)
                gainInner = (gainInner & 0xFF);
                gainOuter = (gainOuter & 0xFF);

                // Combine gainInner and gainOuter into a uint32
                var gainSetting = (gainInner & 0xFF) | ((gainOuter & 0xFF) << 8);

                await openEarable.sensorManager.writeSensorConfig(2, microphoneSamplingRate, gainSetting);
            } else if (openEarable.firmwareVersion === "1.3.0") {
                await openEarable.sensorManager.writeSensorConfig(2, microphoneSamplingRate, 0);
            }

        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting microphone disabled.")
            await openEarable.sensorManager.writeSensorConfig(2, 0, 0);
        }
    });

    $('.btn-disable-sensors').on('click', async function () {
        // Set the sampling rate to 0 for all sensors
        await openEarable.sensorManager.writeSensorConfig(0, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(1, 0, 0);
        await openEarable.sensorManager.writeSensorConfig(2, 0, 0);

        // Uncheck the checkboxes
        $('#areSensorsEnabled, #isMicEnabled, #isPressureSensorEnabled, #innerMicrophoneEnabled, #outerMicrophoneEnabled').prop('checked', false);

        // Reset the dropdowns to 0
        $('#sensorSamplingRate, #microphoneSamplingRate, #pressureSensorSamplingRate').val('0');
        $('#microphoneGainInner').val('40');
        $('#microphoneGainOuter').val('40');
    });

    $('#isMicEnabled').on('change', function () {
        if (!$(this).is(':checked')) {
            $('#innerMicrophoneEnabled').prop('checked', false);
            $('#outerMicrophoneEnabled').prop('checked', false);
        }
    });
    
    $('#innerMicrophoneEnabled').on('change', function () {
        if ($(this).is(':checked')) {
            $('#isMicEnabled').prop('checked', true);
        } else if (!$('#outerMicrophoneEnabled').is(':checked')) {
            $('#isMicEnabled').prop('checked', false);
        }
    });
    
    $('#outerMicrophoneEnabled').on('change', function () {
        if ($(this).is(':checked')) {
            $('#isMicEnabled').prop('checked', true);
        } else if (!$('#innerMicrophoneEnabled').is(':checked')) {
            $('#isMicEnabled').prop('checked', false);
        }
    });    

    $('#microphoneSamplingRate').on('change', function () {
        if ($(this).val() == 0) {
            $('#isMicEnabled').prop('checked', false);
            $('#innerMicrophoneEnabled').prop('checked', false);
            $('#outerMicrophoneEnabled').prop('checked', false);
        }
    });
});
