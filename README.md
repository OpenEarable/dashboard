# 🦻 OpenEarable Dashboard
[Open Dashboard 🡕](https://openearable.github.io/dashboard/)





This repository offers comprehensive web interface for controlling and monitoring OpenEarable. A hosted version of this dashboard is available [here](https://openearable.github.io/dashboard/). The dashboard offers acces to different sensors, audio controls, button events and the RGB LED of OpenEarable. In addition, it shows real-time graphs of accelerometer, gyroscope, magnetomer, pressure, and temperature sensor data. Users can use the dashboard to label incoming data and download the labeled data as csv file ([edge-ml.org](https://edge-ml.org) compatible format for no-code machine learning).

This repository also includes the [OpenEarable.js](https://github.com/OpenEarable/dashboard#openearablejs-library) JavaScript library in the `assets/js/OpenEarable.js` folder. This way, researchers and developers can easily integrate OpenEarable into their own workflows.

## Table of Contents
- Usage
    - Overview
    - Running the Server
- OpenEarable.js Library
    - Installation
    - Usage Examples
        - Connect to OpenEarable
        - Subscribe to Sensor Data
        - Play Audio
        - Control RGB LED
        - Receive Button Events
        - Receive Battery Events

## Usage

### Overview

### Running the server yourself
If you want to run the dashboard yourself and have python3 installed, you can use the following command to run the website from the root of this repository. This will start the webserver at `http://localhost:8000`.
```bash
python3 -m http.server
```

## OpenEarable.js Library
OpenEarable.js is a JavaScript library that provides a seamless interface to connect, manage, and interact with OpenEarable. The library abstracts the complexities of BLE communication, making it easy to fetch device details, manage sensors, LED, and audio, and subscribe to device state changes.

### Installation
To use OpenEarable.js simply integrate the library found under `assets/js/OpenEarable.js` into your project as follows.
```html
<script src="./OpenEarable.js"></script>
```

### Usage Examples
The following example shows how to use the OpenEarable library.

#### Connect to OpenEarable
```js
const openEarable = new OpenEarable();

// Read device information once connected
openEarable.bleManager.subscribeOnConnected(async () => {
    const deviceId = await openEarable.readDeviceIdentifier();
    const firmwareVersion = await openEarable.readHardwareVersion();
    const hardwareVersion = await openEarable.readFirmwareVersion();
});

// Connect to OpenEarable
openEarable.bleManager.connect();

// Disconnect from OpenEarable
openEarable.bleManager.disconnect();
```

#### Subscribe to Sensor Data
```js
// Subscribe to the sensor data
openEarable.subscribeOnSensorDataReceived((data) => {
      // Process the received IMU data
      console.log(data);
});

// Enable IMU at 30 Hz
sensorManager.writeSensorConfig(0, 30, 0); // 0 sensorId, 30 samplingRate
```

#### Play Audio
OpenEarable allows playing mono, 16-bit, 44.1kHz *.wav files from the internal microSD card. In addition, it is possible to generate a constant frequency on the OpenEarable directly or play one of the built-in jingles.

```js
// Supported audio states: AUDIO_STATE.PLAY, AUDIO_STATE.PAUSE, AUDIO_STATE.STOP

// Play audio file from microSD card with the name "music.wav"
openEarable.audioPlayer.wavFile(AUDIO_STATE.PLAY, "music.wav");

// Play a constant frequency sine wave at 22 kHz
// Wave types: WAVE_TYPE.SINE, WAVE_TYPE.TRIANGLE, WAVE_TYPE.SQUARE, WAVE_TYPE.SAW
openEarable.audioPlayer.wavFile(AUDIO_STATE.PLAY, WAVE_TYPE.SINE, 22000);

// Play a default NOTIFICATION jingle from the internal OpenEarable storage
openEarable.audioPlayer.jingle(AUDIO_STATE.PLAY, JINGLE.NOTIFICATION);
```

#### Control RGB LED
```js
// set the LED color to red (accepts values from 0 to 255 for R, G, B)
openEarable.rgbLed.writeLedColor(255, 0, 0); 
```

#### Receive Button Events
TODO

#### Receive Battery Events
```js
openEarable.subscribeBatteryLevelChanged((batteryLevel) => {
    // process battery level here
});

// Supported battery states: BATTERY_STATE.CHARGING, BATTERY_STATE.CHARGED, BATTERY_STATE.NOT_CHARGING
openEarable.subscribeBatteryStateChanged((batteryState) => {
    // process battery state here
});
```

## License
Distributed under the MIT License. See LICENSE for more information.

## Acknowledgements
- developed by the TECO research group at the Karlsruhe Institute of Technology
- icons by Bootstrap Icons
