var chartIds = [
    'accelerometerChart',
    'gyroscopeChart',
    'magnetometerChart',
    'pressureSensorChart',
    'temperatureSensorChart'
];

// Modern colors for each axis and sensor type
var colors = {
    'accelerometerChart': ['#FF6347', '#3CB371', '#1E90FF'],  // Tomatillo, Medium Sea Green, Dodger Blue
    'gyroscopeChart': ['#FFD700', '#FF4500', '#D8BFD8'],      // Gold, OrangeRed, Indigo
    'magnetometerChart': ['#F08080', '#98FB98', '#ADD8E6'],   // Light Coral, PaleGreen, Light Blue
    'pressureSensorChart': ['#32CD32'],                       // LimeGreen
    'temperatureSensorChart': ['#FFA07A']                      // Light Salmon
};

var units = ['m/s\u00B2', '°/s', 'µT', 'Pa', '°C'];

var charts = [];

chartIds.forEach((chartId, index) => {
    var ctx = document.getElementById(chartId);
    var datasets = [];

    // If it's accel, gyro, or mag, we add 3 datasets. Otherwise, just 1 dataset.
    var numDatasets = (index <= 2) ? 3 : 1;
    for (let j = 0; j < numDatasets; j++) {
        datasets.push({
            label: (numDatasets == 3) ? ['X', 'Y', 'Z'][j] : 'value',
            data: [],
            borderColor: colors[chartId][j],
            borderWidth: 1,
            fill: false,
            pointRadius: 0
        });
    }

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    display: false,
                    type: 'linear',
                    title: {
                        display: false,
                        text: 'Sample Index'
                    },
                    min: 0,
                    max: 149
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: units[index]
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });

    chart.id = chartId; // Assign an ID to each chart for easy identification
    charts.push(chart);
});

let prevRawOrientation = {
    pitch: 0,
    roll: 0,
    yaw: 0
};

let prevOrientation = {
    pitch: 0,
    roll: 0,
    yaw: 0
};

function unwrapAngle(newAngle, previousAngle) {
    const diff = newAngle - previousAngle;
    if (diff > 180) {
        return newAngle - 360;
    } else if (diff < -180) {
        return newAngle + 360;
    } else {
        return newAngle;
    }
}

function computeOrientation(acc, mag, alpha = 0.2) {
    let ax = acc[0], ay = acc[1], az = acc[2];
    let mx = mag[0], my = mag[1], mz = mag[2];

    // Pitch & Roll (assuming accelerometer measures -g when resting)
    const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));
    const roll = Math.atan2(ay, az);

    // Yaw (with tilt compensation)
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);
    
    const mxTilt = mx * cosPitch + mz * sinPitch;
    const myTilt = mx * sinRoll * sinPitch + my * cosRoll - mz * sinRoll * cosPitch;
    const yaw = Math.atan2(-myTilt, mxTilt);
    
    // Convert from radians to degrees
    const pitchDeg = pitch * (180.0 / Math.PI);
    const rollDeg = roll * (180.0 / Math.PI);
    const yawDeg = yaw * (180.0 / Math.PI);

    // Smoothing using Exponential Moving Average
    let smoothPitch = alpha * pitchDeg + (1 - alpha) * prevOrientation.pitch;
    let smoothRoll = alpha * rollDeg + (1 - alpha) * prevOrientation.roll;
    let smoothYaw = alpha * yawDeg + (1 - alpha) * prevOrientation.yaw;

    prevOrientation = {
        pitch: smoothPitch,
        roll: smoothRoll,
        yaw: smoothYaw
    };

    return prevOrientation;
}



function updateOrientation(acc, gyro, mag) {
    var rpy = computeOrientation(acc, mag);

    // Update the orientation of the model
    const modelViewerElement = document.querySelector('model-viewer');
    $('#rollAngleValue').text((rpy.roll).toFixed(2));
    $('#pitchAngleValue').text(rpy.pitch.toFixed(2));
    //$('#yawAngleValue').text(0);

    // switch axis because 3d modell has them flipped
    modelViewerElement.setAttribute('orientation', `${rpy.pitch}deg ${-rpy.roll}deg ${0}deg`);
}

var recordMic = false;
var rawData = [];

function createWavFileAndDownload(data) {
    // Convert rawData to WAV format
    var wavData = convertToWav(data); // Implement this function based on your needs

    // Create a Blob and trigger a download
    var blob = new Blob([wavData], { type: 'audio/wav' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'recording.wav';
    a.click();
    URL.revokeObjectURL(url);
}

function convertToWav(rawData) {
    // Implement conversion from raw byte data to WAV format
    // This involves creating a WAV header and concatenating it with raw audio data
    // Here's a basic outline of what this might look like:
    var sampleRate = 2000; // Replace with actual sample rate
    var numChannels = 1; // Replace with number of channels (1 for mono, 2 for stereo)
    var bitsPerSample = 16; // Replace with actual bit depth

    var header = createWavHeader(rawData.length, sampleRate, numChannels, bitsPerSample);
    return new Uint8Array([...header, ...rawData]);
}

function createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
    var byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    var blockAlign = numChannels * (bitsPerSample / 8);

    var header = new Uint8Array(44);
    var view = new DataView(header.buffer);

    // RIFF chunk descriptor
    header.set([82, 73, 70, 70], 0); // "RIFF"
    view.setUint32(4, 36 + dataLength, true); // Chunk size (data length + 36)
    header.set([87, 65, 86, 69], 8); // "WAVE"

    // fmt sub-chunk
    header.set([102, 109, 116, 32], 12); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1 size (16 for PCM)
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, byteRate, true); // Byte rate
    view.setUint16(32, blockAlign, true); // Block align
    view.setUint16(34, bitsPerSample, true); // Bits per sample

    // data sub-chunk
    header.set([100, 97, 116, 97], 36); // "data"
    view.setUint32(40, dataLength, true); // Data chunk size

    return header;
}

function printDataViewAsUint16List(dataView) {
    const length = dataView.byteLength;
    const uint16Array = [];
    
    // Iterate through the DataView in steps of 2 bytes
    for (let i = 0; i < length; i += 2) {
        uint16Array.push(dataView.getUint16(i));
    }
    
    console.log(uint16Array);
}

openEarable.sensorManager.subscribeOnSensorDataReceived((sensorData) => {
    if (sensorData.sensorId === SENSOR_ID.MICROPHONE) {
        if (recordMic) {
            // Drop the first 8 bytes and append the rest
            for (let i = 6; i < sensorData.rawByteData.byteLength; i++) {
                rawData.push(sensorData.rawByteData.getUint8(i));
            }
            printDataViewAsUint16List(sensorData.rawByteData);
        }
    }

    switch (sensorData.sensorId) {
        case 0: // Assuming sensorId 0 is the accelerometer, gyroscope, and magnetometer combined data
            var acc_x = sensorData.ACC.X;
            var acc_y = sensorData.ACC.Y;
            var acc_z = sensorData.ACC.Z;
            var gyr_x = -sensorData.GYRO.X;
            var gyr_y = sensorData.GYRO.Z;
            var gyr_z = sensorData.GYRO.Y;
            var mag_x = -sensorData.MAG.X;
            var mag_y = sensorData.MAG.Z;
            var mag_z = sensorData.MAG.Y;
            var acc = [acc_x, acc_y, acc_z];
            var gyro = [gyr_x, gyr_y, gyr_z];
            var mag = [mag_x, mag_y, mag_z];
            updateChart('accelerometerChart', acc);
            updateChart('gyroscopeChart', gyro);
            updateChart('magnetometerChart', mag);

            updateOrientation(
                acc, gyro, mag
            );
            break;
        case 1:
            updateChart('pressureSensorChart', [sensorData.BARO.Pressure]);
            updateChart('temperatureSensorChart', [sensorData.TEMP.Temperature])

    }
});

function updateChart(chartId, values) {
    const chart = charts.find(chart => chart.id === chartId);
    if (!chart) return;

    if (chart.data.labels.length >= 150) {
        chart.data.labels.shift();
        for (const dataset of chart.data.datasets) {
            dataset.data.shift();
        }
    }

    const nextIndex = chart.data.labels.length > 0
        ? chart.data.labels[chart.data.labels.length - 1] + 1
        : 0;

    chart.data.labels.push(nextIndex);

    for (let i = 0; i < values.length; i++) {
        chart.data.datasets[i].data.push(values[i]);
    }

    if (chart.data.labels.length >= 150) {
        const min = chart.data.labels[0];
        const max = chart.data.labels[chart.data.labels.length - 1];

        // Assuming you're using Chart.js version 3.x or later
        chart.options.scales.x.min = min;
        chart.options.scales.x.max = max;
    }

    chart.update();
}

function onClearGraphs() {
    chartIds.forEach((chartId) => {
        const chart = charts.find(chart => chart.id === chartId);
        if (chart) {
            chart.data.labels.length = 0;
            chart.data.datasets.forEach((dataset) => {
                dataset.data.length = 0;
            });
            chart.options.scales.x.min = 0;
            chart.options.scales.x.max = 149;
            setTimeout(() => chart.update(), 0);
        }
    });
}
