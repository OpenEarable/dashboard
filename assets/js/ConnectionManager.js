var openEarable = new OpenEarable();

openEarable.bleManager.subscribeOnConnected(async () => {
    $('#connectDeviceButton').hide()
    $('#disconnectDeviceButton').show()
    $(".is-connect-enabled").prop('disabled', false);

    // Get device identifier and generation after connected
    const firmwareVersion = await openEarable.readFirmwareVersion();
    const hardwareVersion = await openEarable.readHardwareVersion();

    // Update the DOM with the obtained values
    $('#fwVersion').text(firmwareVersion);
    $('#deviceVersion').text(hardwareVersion);

    $('#connectedDevice').text(openEarable.bleManager.device.name + "")

    log("OpenEarable  '" + openEarable.bleManager.device.name + "' connected.", type = "SUCCESS");
});

openEarable.bleManager.subscribeOnDisconnected(() => {
    $('#disconnectDeviceButton').hide()
    $('#connectDeviceButton').show()
    $(".is-connect-enabled").prop('disabled', true);
    $('#batteryLevel').hide();

    log("OpenEarable disconnected.", type = "WARNING")

    // Reset the values to default when disconnected
    $('#connectedDevice').text("OpenEarable not connected");
    $('#fwVersion').text("X.X.X");
    $('#deviceVersion').text("X.X.X");
});


openEarable.subscribeBatteryLevelChanged((batteryLevel) => {
    $('#batteryLevel').text(' (' + batteryLevel + '%)');
    $('#batteryLevel').show();
})

$('#connectDeviceButton').click(() => {
    log("Scanning for OpenEarables. Please select.", type = "MESSAGE")
    openEarable.bleManager.connect();
});

$('#disconnectDeviceButton').click(() => {
    log("Disconnecting OpenEarable.", type = "MESSAGE")
    openEarable.bleManager.disconnect();
});
