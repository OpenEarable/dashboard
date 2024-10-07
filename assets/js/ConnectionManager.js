var openEarable = new OpenEarable();




const proto = `
syntax = "proto3";

package nextsense;

enum SleepStage {
    SLEEP_STAGE_UNSPECIFIED = 0;
    SLEEP_STAGE_WAKE = 1;
    SLEEP_STAGE_SLEEP = 2;
}

message BudzDataPacket {
    bytes eeeg = 1;
    bytes imu = 2;
    uint32 bt_clock_nclk = 3;
    uint32 bt_clock_nclk_intra = 4;
    uint32 flags = 5;
    uint32 package_num = 6;
    SleepStage sleep_stage = 7;
}
`;

// Parse the proto definition
const root = protobuf.parse(proto).root;
const BudzDataPacket = root.lookupType("nextsense.BudzDataPacket");

// Define constants for IMU packet sizes (similar to EEG)
const IMU_ACCELERATION_SIZE_BYTES = 6; // Assuming 2 bytes per axis (X, Y, Z)
const IMU_ANGULAR_SPEED_SIZE_BYTES = 6; // Assuming 2 bytes per axis (X, Y, Z)

let imuChart; // Variable to hold the IMU chart
let accumulatedImuData = []; // Buffer to store incoming IMU data
const maxImuDataPoints = 500; // Max data points for IMU chart

// Initialize the IMU Chart
function initImuChart() {

    if (imuChart) {
        imuChart.destroy();
    }

    const ctx = document.getElementById('imuChart').getContext('2d');
    imuChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'IMU Acceleration X',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                pointRadius: 0
            }, {
                label: 'IMU Acceleration Y',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1,
                pointRadius: 0
            }, {
                label: 'IMU Acceleration Z',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Sample'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Acceleration (m/s²)'
                    }
                }
            },
            animation: {
                duration: 0
            }
        }
    });
}

// Update the IMU chart
function updateImuChart(newData) {
    accumulatedImuData = accumulatedImuData.concat(newData);

    // Only proceed if we have enough data to downsample
    if (accumulatedImuData.length >= downsampleFactor) {
        const downsampledData = [];

        for (let i = 0; i < accumulatedImuData.length; i += downsampleFactor) {
            downsampledData.push(accumulatedImuData[i]);
        }

        accumulatedImuData = []; // Clear the accumulated data buffer

        const chart = imuChart;

        // Update each dataset in the IMU chart
        for (let i = 0; i < downsampledData.length; i++) {
            const [accX, accY, accZ] = downsampledData[i];

            chart.data.datasets[0].data.push(accX); // Acceleration X
            chart.data.datasets[1].data.push(accY); // Acceleration Y
            chart.data.datasets[2].data.push(accZ); // Acceleration Z
        }

        // Ensure that we do not exceed the maximum data points
        if (chart.data.datasets[0].data.length > maxImuDataPoints) {
            for (let dataset of chart.data.datasets) {
                dataset.data.splice(0, dataset.data.length - maxImuDataPoints);
            }
        }

        chart.data.labels = chart.data.datasets[0].data.map((_, index) => index);
        chart.update('none'); // Faster updates
    }
}

function processPacket(buffer) {
    const packet = new Uint8Array(buffer);
    if (packet.length < 3) {
        throw new Error("FirmwareMessageParsingError: EMPTY_VALUES");
    }

    const leftProtoLength = packet[0] & 0xff;
    const rightProtoLength = packet[1] & 0xff;

    if (leftProtoLength === 0 && rightProtoLength === 0) {
        throw new Error("FirmwareMessageParsingError: EMPTY_PROTOS");
    }

    const deviceLocation = leftProtoLength > 0 ? 'leftEarbud' : 'rightEarbud';
    const protoLength = deviceLocation === 'leftEarbud' ? leftProtoLength : rightProtoLength;

    if (protoLength > packet.length - 2) {
        throw new Error("FirmwareMessageParsingError: PROTO_LENGTH_HIGHER");
    }

    const protoBytes = packet.slice(2);

    try {
        const budzDataPacket = BudzDataPacket.decode(protoBytes);

        if (budzDataPacket.eeeg && budzDataPacket.eeeg.length > 0) {
            const eegValues = parseEegData(budzDataPacket.eeeg, deviceLocation);
            eegValues.forEach(eegValue => {
                console.log(`Raw microvolt: ${eegValue}`);
                updateEEGChart(eegValue);
            });
        } else {
            console.log("BudzDataPacket eeg is empty.");
        }

        if (budzDataPacket.imu && budzDataPacket.imu.length > 0) {
            const imuData = parseImuData(budzDataPacket.imu);
            updateImuChart(imuData);
        } else {
            console.log("BudzDataPacket imu is empty.");
        }
    } catch (error) {
        throw new Error(`FirmwareMessageParsingError: ERROR_PARSING_PROTO_DATA - ${error.message}`);
    }
}

// Parse IMU Data
function parseImuData(imuBuffer) {
    const imuValues = [];

    for (let i = 0; i < imuBuffer.length; i += (IMU_ACCELERATION_SIZE_BYTES + IMU_ANGULAR_SPEED_SIZE_BYTES)) {
        if (i + IMU_ACCELERATION_SIZE_BYTES + IMU_ANGULAR_SPEED_SIZE_BYTES <= imuBuffer.length) {
            const acceleration = parseSingleAccelerationPacket(imuBuffer.slice(i, i + IMU_ACCELERATION_SIZE_BYTES));
            const angularSpeed = parseSingleAngularSpeedPacket(imuBuffer.slice(i + IMU_ACCELERATION_SIZE_BYTES, i + IMU_ACCELERATION_SIZE_BYTES + IMU_ANGULAR_SPEED_SIZE_BYTES));
            imuValues.push([...acceleration, ...angularSpeed]); // Combine acceleration and angular speed data
        }
    }

    return imuValues;
}

// Parse a single IMU acceleration packet
function parseSingleAccelerationPacket(imuBufferBytes) {
    const x = (imuBufferBytes[0] | (imuBufferBytes[1] << 8)) / 32768 * 16; // Scale factor for m/s²
    const y = (imuBufferBytes[2] | (imuBufferBytes[3] << 8)) / 32768 * 16;
    const z = (imuBufferBytes[4] | (imuBufferBytes[5] << 8)) / 32768 * 16;
    return [x, y, z]; // Return acceleration data
}

// Parse a single IMU angular speed packet
function parseSingleAngularSpeedPacket(imuBufferBytes) {
    const x = (imuBufferBytes[0] | (imuBufferBytes[1] << 8)) / 32768 * 2000; // Scale factor for degrees/sec
    const y = (imuBufferBytes[2] | (imuBufferBytes[3] << 8)) / 32768 * 2000;
    const z = (imuBufferBytes[4] | (imuBufferBytes[5] << 8)) / 32768 * 2000;
    return [x, y, z]; // Return angular speed data
}

// Initialize both charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initEEGChart();
    initImuChart();
});

function parseEegData(eegBuffer, deviceLocation) {
    const eegValues = [];
    for (let i = 0; i < eegBuffer.length; i += 3) {
        if (i + 2 < eegBuffer.length) {
            const eegValue = parseSingleEegPacket(eegBuffer.slice(i, i + 3), deviceLocation);
            eegValues.push(eegValue);
        }
    }
    return eegValues;
}

function parseSingleEegPacket(eegBufferBytes, deviceLocation) {
    const eegValue = (eegBufferBytes[0] & 0x3f) | (eegBufferBytes[1] << 6) | (eegBufferBytes[2] << 14);
    return convertToMicrovolt(eegValue);
}

const AFE_FS = 1.1;
const AFE_GAIN = 12;

function convertToMicrovolt(data) {
    if (data <= 2097151) {
        return (data * 1000000) / (Math.pow(2, 21) - 1) * AFE_FS / AFE_GAIN;
    } else {
        return ((data - Math.pow(2, 22)) * 1000000) / Math.pow(2, 21) * AFE_FS / AFE_GAIN;
    }
}


let eegChart;
const maxDataPoints = 500; // Adjust this value to show more or fewer data points

function initEEGChart() {
    if (eegChart) {
        eegChart.destroy();
    }
    const ctx = document.getElementById('eegChart').getContext('2d');
    eegChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'EEG Data',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Sample'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Microvolts (µV)'
                    }
                }
            },
            animation: {
                duration: 0
            }
        }
    });
}
let accumulatedData = [];  // Buffer to store incoming data
let downsampleFactor = 10; // Downsample from 1000Hz to 100Hz (1 out of 10 samples)

function updateEEGChart(newData) {
    // Accumulate the new data
    accumulatedData = accumulatedData.concat(newData);

    // Only proceed if we have enough data to downsample
    if (accumulatedData.length >= downsampleFactor) {
        const downsampledData = [];

        // Downsample by taking every 10th sample
        for (let i = 0; i < accumulatedData.length; i += downsampleFactor) {
            downsampledData.push(accumulatedData[i]);
        }

        // Clear the accumulatedData buffer
        accumulatedData = [];

        // Now update the chart with downsampled data
        const chart = eegChart;
        const dataset = chart.data.datasets[0];

        dataset.data = dataset.data.concat(downsampledData);
        if (dataset.data.length > maxDataPoints) {
            dataset.data.splice(0, dataset.data.length - maxDataPoints);
        }

        chart.data.labels = dataset.data.map((_, index) => index);
        chart.update('none'); // Use 'none' mode for faster updates
    }
}



openEarable.bleManager.subscribeOnConnected(async () => {

    if (openEarable.bleManager.device.name.toString().startsWith("AH203_")) {

        // need to sub to all characteristics to make sure streaming works
        await openEarable.bleManager.subscribeCharacteristicNotifications("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3041-6972-6f6861424c45", () => {

        });
        await openEarable.bleManager.subscribeCharacteristicNotifications("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3141-6972-6f6861424c45", () => {
        });

        console.log("subscribing to first...")

        await openEarable.bleManager.subscribeCharacteristicNotifications(
            "7319494d-2dab-0341-6972-6f6861424c45",
            "73194152-2dab-3141-6972-6f6861424c45",
            (event) => {
                const dataView = event.target.value;
                const result = processPacket(dataView.buffer);
            }
        );


        var startStreamCommand = new Uint8Array([0x05, 0x5A, 0x05, 0x00, 0x01, 0x00, 0x05, 0x02, 0x01]);
        await openEarable.bleManager.writeCharacteristic("5052494d-2dab-0341-6972-6f6861424c45", "43484152-2dab-3241-6972-6f6861424c45", startStreamCommand);


        return;
    }
    else {

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
    }
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
