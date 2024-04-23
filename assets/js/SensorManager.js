
$(document).ready(function () {
    const updateButtonStyles = function() {
        ["btnL", "btnR"].forEach(function (id) {
            $("#" + id).css({
                "border": "3px solid transparent",
                "font-weight": "normal"
            });
        });

        $("#btn" + selectedEarable).css({
            "border": "3px solid #77F2A1",
            "font-weight": "bold"
        });
    };

    updateButtonStyles();

    $("#btnL").click(function (e) {
        e.stopPropagation();
        selectedEarable = EarableSide.LEFT;
        updateButtonStyles();
        onClearGraphs();
    });

    $("#btnR").click(function (e) {
        e.stopPropagation();
        selectedEarable = EarableSide.RIGHT;
        updateButtonStyles();
        onClearGraphs();
    });
    
    $('.sampling-rate-input').on('change', function() {

        var selects = $('.sampling-rate-input');
        var changedElem = $(this);
        var changedIndex = selects.index(changedElem);
        
        // Handle select behavior of Microphone 1 and Microphone 2
        if (changedIndex === 0) {
            if (changedElem.val() !== '0') {
                changedElem.removeClass('fake-disabled-select');
                selects.eq(1).addClass('fake-disabled-select').val('0');
                selects.eq(2).addClass('fake-disabled-select').val('0');
                selects.eq(3).removeClass('fake-disabled-select');
            } else {
                selects.eq(1).removeClass('fake-disabled-select');
                if (selects.eq(3).val() === '0') {
                    selects.eq(2).removeClass('fake-disabled-select');
                }
            }
        } else if (changedIndex === 2) {
            if (changedElem.val() !== '0') {
                changedElem.removeClass('fake-disabled-select');
                selects.eq(0).addClass('fake-disabled-select').val('0');
                selects.eq(3).addClass('fake-disabled-select').val('0');
                selects.eq(1).removeClass('fake-disabled-select');
            } else {
                selects.eq(3).removeClass('fake-disabled-select');
                if (selects.eq(1).val() === '0') {
                    selects.eq(0).removeClass('fake-disabled-select');
                }
            }
        } else if (changedIndex === 1) {
            if (changedElem.val() !== '0') {
                changedElem.removeClass('fake-disabled-select');
                selects.eq(0).addClass('fake-disabled-select').val('0');
                if (selects.eq(3).val() === '0') {
                    selects.eq(2).removeClass('fake-disabled-select');
                }
            } else {
                if (selects.eq(2).val() === '0') {
                    selects.eq(0).removeClass('fake-disabled-select');
                }
            }
        } else if (changedIndex == 3) {
            if (changedElem.val() !== '0') {
                changedElem.removeClass('fake-disabled-select');
                selects.eq(2).addClass('fake-disabled-select').val('0');
                if (selects.eq(1).val() === '0') {
                    selects.eq(0).removeClass('fake-disabled-select');
                }
            } else {
                if (selects.eq(0).val() === '0') {
                    selects.eq(2).removeClass('fake-disabled-select');
                }
            }
        }

        // update checkboxes
        selects.each(function(index) {
            if (index % 2 === 0) {
                var checkbox = $(this).closest('.grid-row').find('input[type="checkbox"]');
                var neighbor = selects.eq(index+1);
                if ($(this).val() !== '0' || neighbor.val() !== '0') {
                    checkbox.prop('checked', true);
                } else {
                    checkbox.prop('checked', false);
                }
                
            }
            
        })
        
    });    

    $('#setSensorConfigurationButton').on('click', async function() {
        // Check if the checkbox for the first set of sensors is checked
        if ($('#areSensorsEnabled').is(':checked')) {
            var sensorSamplingRate = $('#sensorSamplingRate').val();
            log("Setting sampling rate for IMU: " + sensorSamplingRate + " Hz")
            await openEarableL.sensorManager.writeSensorConfig(0, sensorSamplingRate, 0);
            await openEarableR.sensorManager.writeSensorConfig(0, sensorSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting IMU disabled.")
            await openEarableL.sensorManager.writeSensorConfig(0, 0, 0);
            await openEarableR.sensorManager.writeSensorConfig(0, 0, 0);
        }

        if ($('#isPressureSensorEnabled').is(':checked')) {
            var pressureSensorSamplingRate = $('#pressureSensorSamplingRate').val();
            log("Setting sampling rate for pressure sensor: " + pressureSensorSamplingRate + " Hz")
            await openEarableL.sensorManager.writeSensorConfig(1, pressureSensorSamplingRate, 0);
            await openEarableR.sensorManager.writeSensorConfig(1, pressureSensorSamplingRate, 0);
        } else {
            log("Setting pressure sensor disabled.")
            await openEarableL.sensorManager.writeSensorConfig(1, 0, 0);
            await openEarableR.sensorManager.writeSensorConfig(1, 0, 0);
        }

        if ($('#isOpticalTemperatureSensorEnabled').is(':checked')) {
            var opticalTemperatureSensorSamplingRate = $('#opticalTemperatureSensorSamplingRate').val();
            log("Setting sampling rate for optical temperature sensor: " + opticalTemperatureSensorSamplingRate + " Hz")
            await openEarableL.sensorManager.writeSensorConfig(5, opticalTemperatureSensorSamplingRate, 0);
            await openEarableR.sensorManager.writeSensorConfig(5, opticalTemperatureSensorSamplingRate, 0);
        } else {
            log("Setting pressure sensor disabled.")
            await openEarableL.sensorManager.writeSensorConfig(5, 0, 0);
            await openEarableR.sensorManager.writeSensorConfig(5, 0, 0);
        }

        // Check if the checkbox for the microphone is checked
        if ($('#isMicEnabled').is(':checked')) {
            var microphoneSamplingRate = $('#microphone1SamplingRate').val();
            log("Setting sampling rate for microphone: " + microphoneSamplingRate + " Hz")
            await openEarableL.sensorManager.writeSensorConfig(2, microphoneSamplingRate, 0);
            await openEarableR.sensorManager.writeSensorConfig(2, microphoneSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting microphone disabled.")
            await openEarableL.sensorManager.writeSensorConfig(2, 0, 0);
            await openEarableR.sensorManager.writeSensorConfig(2, 0, 0);
        }

        // Check if the checkbox for the PPG is checked
        if ($('#isPPGEnabled').is(':checked')) {
            var ppgSamplingRate = $('#ppgSamplingRate').val();
            log("Setting sampling rate for PPG sensor: " + ppgSamplingRate + " Hz")
            await openEarable.sensorManager.writeSensorConfig(3, ppgSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting PPG sensor disabled.")
            await openEarable.sensorManager.writeSensorConfig(3, 0, 0);
        }
         // Check if the checkbox for the microphone is checked
         if ($('#isVitalEnabled').is(':checked')) {
            var vitalsSamplingRate = $('#vitalsSamplingRate').val();
            log("Setting sampling rate for vitals (heart): " + ppgSamplingRate + " Hz")
            await openEarable.sensorManager.writeSensorConfig(4, vitalsSamplingRate, 0);
        } else {
            // If the checkbox is not checked, set the sampling rate to 0
            log("Setting PPG sensor disabled.")
            await openEarable.sensorManager.writeSensorConfig(4, 0, 0);
        }
    });

    $('.btn-disable-sensors').on('click', async function() {
        // Set the sampling rate to 0 for all sensors
        await openEarableL.sensorManager.writeSensorConfig(0, 0, 0);
        await openEarableL.sensorManager.writeSensorConfig(1, 0, 0);
        await openEarableL.sensorManager.writeSensorConfig(2, 0, 0);
        await openEarableR.sensorManager.writeSensorConfig(0, 0, 0);
        await openEarableR.sensorManager.writeSensorConfig(1, 0, 0);
        await openEarableR.sensorManager.writeSensorConfig(2, 0, 0);
        //await openEarable.sensorManager.writeSensorConfig(?, 0, 0); PPG Sensor

        // Uncheck the checkboxes
        $('#areSensorsEnabled, #isMicEnabled, #isPressureSensorEnabled, #isPPGEnabled').prop('checked', false);

        // Reset the dropdowns to 0
        $('#sensorSamplingRate, #microphone1SamplingRate, #pressureSensorSamplingRate, #ppgSamplingRate').val('0');
    });
});
