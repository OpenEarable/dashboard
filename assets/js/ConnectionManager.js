var openEarableL = new OpenEarable();
var openEarableR = new OpenEarable();


function subscribeOnConnectedCallback(side) {
    return async () => {
        // Get device identifier and generation after connected
        const firmwareVersion = await this.readFirmwareVersion();
        const hardwareVersion = await this.readHardwareVersion();

        openEarable.buttonManager.subscribeOnButtonStateChanged((state) => {
            fadeBackground(state);
        });

        $('#disconnectDeviceButton' + side).prop('disabled', false);

        // Update the DOM with the obtained values
        $('#fwVersion' + side).text(firmwareVersion);
        $('#deviceVersion' + side).text(hardwareVersion);

        $('#connectedDevice' + side).text(this.bleManager.device.name + "");

        log("OpenEarable '" + this.bleManager.device.name + "' connected.", type = "SUCCESS");
    };
}

openEarableL.bleManager.subscribeOnConnected(subscribeOnConnectedCallback('L'));
openEarableR.bleManager.subscribeOnConnected(subscribeOnConnectedCallback('R'));

function subscribeOnDisconnectedCallback(side) {
    $('#disconnectDeviceButton' + side).hide()
    $('#connectDeviceButton' + side).show()
    $("#connectDeviceButton" + side).prop('disabled', false);
    $('#batteryLevel' + side).text("XX")
    $('#batteryChargingIndicator' + side).hide();
    $('#batteryChargedIndicator' + side).hide();

    log("OpenEarable (" + side + ") disconnected.", type = "WARNING")

    // Reset the values to default when disconnected
    $('#connectedDevice' + side).text("OpenEarable-XXXX");
    $('#fwVersion' + side).text("X.X.X");
    $('#deviceVersion' + side).text("X.X.X");

    // Not very elegant but bleManager has no connected property. Might add later
    try {
        openEarableL.ensureConnected();
    } catch (error) {
        try {
            openEarableR.ensureConnected();
        } catch {
            $(".is-connect-enabled").prop('disabled', true);
        }
    }
}
openEarableL.bleManager.subscribeOnDisconnected(subscribeOnDisconnectedCallback("L"));
openEarableR.bleManager.subscribeOnDisconnected(subscribeOnDisconnectedCallback("R"));


function batteryLevelChangedCallback(side) {
    return (batteryLevel) => {
        $('#connectDeviceButton' + side).hide();
        $('#disconnectDeviceButton' + side).show();
        $(".is-connect-enabled").prop('disabled', false);

        $('#batteryLevel' + side).text(batteryLevel);
        $('#batteryLevel' + side).show();
    };
}

openEarableL.subscribeBatteryLevelChanged(batteryLevelChangedCallback('L'));
openEarableR.subscribeBatteryLevelChanged(batteryLevelChangedCallback('R'));

function batteryStateChangedCallback(side) {
    return (batteryState) => {
        if (batteryState === 1) {
            $('#batteryChargingIndicator' + side).show();
            $('#batteryChargedIndicator' + side).hide();
        } else if (batteryState === 2) {
            $('#batteryChargedIndicator' + side).show();
            $('#batteryChargingIndicator' + side).hide();
        } else {
            $('#batteryChargingIndicator' + side).hide();
            $('#batteryChargedIndicator' + side).hide();
        }
    };
}

openEarableL.subscribeBatteryStateChanged(batteryStateChangedCallback('L'));
openEarableR.subscribeBatteryStateChanged(batteryStateChangedCallback('R'));





$('#connectDeviceButtonL').click(async () => {
    console.log("LEFT BUTTON CLICKED");
    handleConnectButtonClick(openEarableL, '#connectDeviceButtonL');
});

$('#connectDeviceButtonR').click(async () => {
    handleConnectButtonClick(openEarableR, '#connectDeviceButtonR');
});

async function handleConnectButtonClick(openEarable, buttonSelector) {
    $(buttonSelector).prop('disabled', true);
    log("Scanning for OpenEarables. Please select.", type = "MESSAGE");
    try {
        await openEarable.bleManager.connect();
    } catch (e) {
        $(buttonSelector).prop('disabled', false);
    }
}


$('#disconnectDeviceButtonL').click(() => {
    handleDisconnectButtonClick(openEarableL, '#disconnectDeviceButtonL');
});

$('#disconnectDeviceButtonR').click(() => {
    handleDisconnectButtonClick(openEarableR, '#disconnectDeviceButtonR');
});

function handleDisconnectButtonClick(openEarable, buttonSelector) {
    $(buttonSelector).prop('disabled', true);
    log("Disconnecting OpenEarable.", type = "MESSAGE");
    openEarable.bleManager.disconnect();
}

function fadeBackground(value) {
    console.log(value)
    if (value === 1) {
        $('body').addClass('bg-green');

        setTimeout(() => {
            $('body').removeClass('bg-green');
        }, 500);
    }
}
