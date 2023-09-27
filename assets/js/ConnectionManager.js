var openEarable = new OpenEarable();

openEarable.bleManager.subscribeOnConnected( () => {
    $('#connectDeviceButton').hide()
    $('#disconnectDeviceButton').show()
    $(".is-connect-enabled").prop('disabled', false);
    $('#connectedDevice').text(openEarable.bleManager.device.name + "")

    log("OpenEarable  '" + openEarable.bleManager.device.name + "' connected.", type = "SUCCESS");
});

openEarable.bleManager.subscribeOnDisconnected( () => {
    $('#disconnectDeviceButton').hide()
    $('#connectDeviceButton').show()
    $(".is-connect-enabled").prop('disabled', true);
    $('#batteryLevel').hide();

    log("OpenEarable disconnected.", type = "WARNING")
    
    $('#connectedDevice').text("OpenEarable not connected")
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
