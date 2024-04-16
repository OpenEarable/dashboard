var openEarableL = new OpenEarable();
var openEarableR = new OpenEarable();
const EarableSide = {
    LEFT: 'L',
    RIGHT: 'R'
};
var selectedEarable = EarableSide.LEFT;
function subscribeOnConnectedCallback(openEarable, side) {
    return async () => {
        // Get device identifier and generation after connected
        const firmwareVersion = await openEarable.readFirmwareVersion();
        const hardwareVersion = await openEarable.readHardwareVersion();

        openEarable.buttonManager.subscribeOnButtonStateChanged((state) => {
            fadeBackground(state);
        });

        $('#disconnectDeviceButton' + side).prop('disabled', false);
        $('#btn' + side).css('opacity', '1.0');
        // Update the DOM with the obtained values
        $('#fwVersion' + side).text(firmwareVersion);
        $('#deviceVersion' + side).text(hardwareVersion);

        $('#connectedDevice' + side).text(openEarable.bleManager.device.name + "");

        log("OpenEarable '" + openEarable.bleManager.device.name + "' connected.", type = "SUCCESS");
    };
}

openEarableL.bleManager.subscribeOnConnected(subscribeOnConnectedCallback(openEarableL, EarableSide.LEFT));
openEarableR.bleManager.subscribeOnConnected(subscribeOnConnectedCallback(openEarableR, EarableSide.RIGHT));

function subscribeOnDisconnectedCallback(side) {
    return () => {
        $('#btn' + side).css('opacity', '0.2');
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
}
openEarableL.bleManager.subscribeOnDisconnected(subscribeOnDisconnectedCallback(EarableSide.LEFT));
openEarableR.bleManager.subscribeOnDisconnected(subscribeOnDisconnectedCallback(EarableSide.RIGHT));


function batteryLevelChangedCallback(side) {
    return (batteryLevel) => {
        $('#connectDeviceButton' + side).hide();
        $('#disconnectDeviceButton' + side).show();
        $(".is-connect-enabled").prop('disabled', false);

        $('#batteryLevel' + side).text(batteryLevel);
        $('#batteryLevel' + side).show();
    };
}

openEarableL.subscribeBatteryLevelChanged(batteryLevelChangedCallback(EarableSide.LEFT));
openEarableR.subscribeBatteryLevelChanged(batteryLevelChangedCallback(EarableSide.RIGHT));

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

openEarableL.subscribeBatteryStateChanged(batteryStateChangedCallback(EarableSide.LEFT));
openEarableR.subscribeBatteryStateChanged(batteryStateChangedCallback(EarableSide.RIGHT));





$('#connectDeviceButtonL').click(async () => {
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
    handleDisconnectButtonClick(openEarableL, EarableSide.LEFT);
});

$('#disconnectDeviceButtonR').click(() => {
    handleDisconnectButtonClick(openEarableR, EarableSide.RIGHT);
});

function handleDisconnectButtonClick(openEarable, side) {
    $('#disconnectDeviceButton' + side).prop('disabled', true);
    log("Disconnecting OpenEarable (" + side + ").", type = "MESSAGE");
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
