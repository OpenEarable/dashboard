var openEarable = new OpenEarable();

openEarable.bleManager.subscribeOnConnected(async () => {

    if (openEarable.bleManager.device.name.toString().startsWith("AH203_")) {
        console.log("subscribing to first...")

        // need to sub to all characteristics to make sure streaming works
        await openEarable.bleManager.subscribeCharacteristicNotifications("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3041-6972-6f6861424c45", () => {

        });
        await openEarable.bleManager.subscribeCharacteristicNotifications("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3141-6972-6f6861424c45", () => {
        });
        var hexDataArray = [];
        await openEarable.bleManager.subscribeCharacteristicNotifications(
            "7319494d-2dab-0341-6972-6f6861424c45", 
            "73194152-2dab-3141-6972-6f6861424c45", 
            (data) => {
                let hexString = Array.from(new Uint8Array(data.srcElement.value))
                                     .map(byte => byte.toString(16).padStart(2, '0'))
                                     .join('');
                console.log(hexString);
                
                hexDataArray.push(hexString);
                
                if (hexDataArray.length >= 50) {
                    let fileContent = hexDataArray.join('\n');
                    let blob = new Blob([fileContent], {type: 'text/plain'});
                    let link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'hex_data.txt';
                    link.click();
                    
                    // Optionally stop the subscription once 50 entries are collected
                    openEarable.bleManager.unsubscribeCharacteristicNotifications("7319494d-2dab-0341-6972-6f6861424c45", "73194152-2dab-3141-6972-6f6861424c45");
                    hexDataArray = [];
                }
            }
        );
        

        var startStreamCommand = new Uint8Array([0x05, 0x5A, 0x05, 0x00, 0x01, 0x00, 0x05, 0x02, 0x01]);
        await openEarable.bleManager.writeCharacteristic("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3241-6972-6f6861424c45", startStreamCommand);


        return;
    }

    // Get device identifier and generation after connected
    const firmwareVersion = await openEarable.readFirmwareVersion();
    const hardwareVersion = await openEarable.readHardwareVersion();

    if (firmwareVersion === "1.3.0") {
        $('.1-4-0-controls').hide();
        $('.1-3-0-controls').show();
    } else if (firmwareVersion === "1.4.0") {
        $('.1-4-0-controls').show();
        $('.1-3-0-controls').hide();
    }

    openEarable.buttonManager.subscribeOnButtonStateChanged((state) => {
        fadeBackground(state);
    })

    $('#disconnectDeviceButton').prop('disabled', false);

    // Update the DOM with the obtained values
    $('#fwVersion').text(firmwareVersion);
    $('#deviceVersion').text(hardwareVersion);

    $('#connectedDevice').text(openEarable.bleManager.device.name + "")

    log("OpenEarable  '" + openEarable.bleManager.device.name + "' connected.", type = "SUCCESS");
});

openEarable.bleManager.subscribeOnDisconnected(() => {
    $('#disconnectDeviceButton').hide()
    $('#connectDeviceButton').show()
    $("#connectDeviceButton").prop('disabled', false);
    $('#batteryLevel').text("XX")
    $('#batteryChargingIndicator').hide();
    $('#batteryChargedIndicator').hide();

    log("OpenEarable disconnected.", type = "WARNING")

    // Reset the values to default when disconnected
    $('#connectedDevice').text("OpenEarable-XXXX");
    $('#fwVersion').text("X.X.X");
    $('#deviceVersion').text("X.X.X");
});


openEarable.subscribeBatteryLevelChanged((batteryLevel) => {
    $('#connectDeviceButton').hide()
    $('#disconnectDeviceButton').show()
    $(".is-connect-enabled").prop('disabled', false);

    $('#batteryLevel').text(batteryLevel);
    $('#batteryLevel').show();
})

openEarable.subscribeBatteryStateChanged((batteryState) => {
    if (batteryState === 1) {
        $('#batteryChargingIndicator').show();
        $('#batteryChargedIndicator').hide();
    } else if (batteryState === 2) {
        $('#batteryChargedIndicator').show();
        $('#batteryChargingIndicator').hide();
    } else {
        $('#batteryChargingIndicator').hide();
        $('#batteryChargedIndicator').hide();
    }

})

$('#connectDeviceButton').click(async () => {
    $('#connectDeviceButton').prop('disabled', true);
    log("Scanning for OpenEarables. Please select.", type = "MESSAGE")
    try {
        await openEarable.bleManager.connect();
    } catch (e) {
        $('#connectDeviceButton').prop('disabled', false);
    }

});

$('#disconnectDeviceButton').click(() => {
    $(".is-connect-enabled").prop('disabled', true);
    $('#disconnectDeviceButton').prop('disabled', true);
    log("Disconnecting OpenEarable.", type = "MESSAGE")
    openEarable.bleManager.disconnect();
});

function fadeBackground(value) {
    console.log(value)
    if (value === 1) {
        $('body').addClass('bg-green');

        setTimeout(() => {
            $('body').removeClass('bg-green');
        }, 500);
    }
}
