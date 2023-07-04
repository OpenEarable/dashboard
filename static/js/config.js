/*
Here are the configurations that are sent to the sensors.
Each sensor needs to be enabled with a configuration command containing the sensor ID, Sampling rate and a latency.
(Here latency is automatically set to 0)
*/

export const deviceName = "Earable";
export const timestamped = true;

var SENS_minimal = [
    [0, 10]
]

var SENS_test = [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1]
]

var SENS_operation = [
    [0, 5],                // Accelerometer corrected
    [1, 5],                // Gyroscope corrected
    [2, 1],                // Barometer
    [3, 1],                // Temperature
    [4, 5],                // Magnetometer
    [5, 0]                 // PDM Mic
]

var SENS_none = []

export var EXCLUDE_DETECT = [
    5
];

export var SENS_Recorder = SENS_operation;
export var SENS_Dashboard = SENS_minimal;
export var SENS_DEFAULT = SENS_operation;
