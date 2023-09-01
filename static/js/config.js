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

var SENS_none = []

var SENS_basic_all = [
    [4, 10, 1]
]

var SENS_default_dropdown = [
    [0, 1],
    [1, 2]
]

export var EXCLUDE_DETECT = [
    2,
    3,
    4
];

export var SENS_Recorder = SENS_basic_all;
export var SENS_Dashboard = SENS_minimal;
export var SENS_DEFAULT = SENS_default_dropdown;
