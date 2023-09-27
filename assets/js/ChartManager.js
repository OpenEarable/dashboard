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


var units = ['g', '°/s', 'µT', 'hPa', '°C'];

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
                    }
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

function computeYaw(pitch, roll, mag) {
    // Transform magnetometer readings from body frame to Earth frame
    const magX = mag[0] * Math.cos(pitch) + mag[2] * Math.sin(pitch);
    const magY = mag[0] * Math.sin(roll) * Math.sin(pitch) + mag[1] * Math.cos(roll) - mag[2] * Math.sin(roll) * Math.cos(pitch);

    // Compute yaw angle
    const yaw = Math.atan2(-magY, magX) * (180 / Math.PI);

    return yaw;
}

function constrainAngle(angle) {
    while (angle <= -180) angle += 360;
    while (angle > 180) angle -= 360;
    return angle;
}


const madgwick = AHRS({
    sampleInterval: 30,
    algorithm: 'Madgwick',
    beta: 0.4,
    kp: 0.5, // Default: 0.5
    ki: 0, // Default: 0.0
    doInitialisation: false,
  });

function updateOrientation(acc, gyro, mag) {
    const { pitch, roll } = computePitchAndRollFromAccel(acc);

    adgwick.update(gyro[0], gyro[1], gyro[2], accel[0], accel[1], accel[2], compass[0], compass[1], compass[2]);
    console.log(madgwick.getEulerAngles());

    const modelViewerElement = document.querySelector('model-viewer');
    modelViewerElement.setAttribute('orientation', `${pitch}deg ${roll}deg 0`);
}

openEarable.sensorManager.subscribeOnSensorDataReceived((sensorData) => {
    switch (sensorData.sensorId) {
        case 0: // Assuming sensorId 0 is the accelerometer, gyroscope, and magnetometer combined data
            updateChart('accelerometerChart', [sensorData.ACC.X, sensorData.ACC.Y, sensorData.ACC.Z]);
            updateChart('gyroscopeChart', [sensorData.GYRO.X, sensorData.GYRO.Y, sensorData.GYRO.Z]);
            updateChart('magnetometerChart', [sensorData.MAG.X, sensorData.MAG.Y, sensorData.MAG.Z]);

            updateOrientation(
                [sensorData.ACC.X, sensorData.ACC.Y, sensorData.ACC.Z],
                [sensorData.GYRO.X, sensorData.GYRO.Y, sensorData.GYRO.Z],
                [sensorData.MAG.X, sensorData.MAG.Y, sensorData.MAG.Z]
            );
            break;
        
    }
});

function updateChart(chartId, values) {
    const chart = charts.find(chart => chart.id === chartId);
    if (!chart) return;

    if (chart.data.labels.length >= 30 * 5) {
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

    chart.update();
}