# 🦻 OpenEarable Dashboard
This repository offers comprehensive web interface for controlling and monitoring OpenEarable. The dashboard offers acces to different sensors, audio controls, the button and the RGB LED of OpenEarable. In addition, it shows real-time graphs of accelerometer, gyroscope, magnetomer, pressure sensor, and temperature sensor data. Users can use the dashboard to label incoming data and download the labeled data as csv file ([edge-ml.org](https://edge-ml.org) compatible format).

This repository also includes the [OpenEarable.js](https://github.com/OpenEarable/dashboard#openearablejs-library) JavaScript library in the assets folder `assets/js/OpenEarable.js`.

## Usage

## OpenEarable.js Library
OpenEarable.js is a JavaScript library that provides a seamless interface to connect, manage, and interact with OpenEarable. The library abstracts the complexities of BLE communication, making it easy to fetch device details, manage sensors, LED, and audio, and subscribe to device state changes.

### Installation
To use OpenEarable.js simply integrate the library found under `assets/js/OpenEarable.js` into your project as follows.
```html
<script src="./OpenEarable.js"></script>
```

### Usage Example
The following example shows how to use the OpenEarable library.

#### Connect to OpenEarable
```js
const openEarable = new OpenEarable();

// Read device identifier once connected
openEarable.bleManager.subscribeOnConnected(async () => {
    const deviceId = await earable.readDeviceIdentifier();
    console.log(`Connected to device: ${deviceId}`);
});

// Connect to the BLE device
openEarable.bleManager.connect();
```

#### Subscribe to Sensor Data
```js
// Subscribe to the sensor data
openEarable.subscribeOnSensorDataReceived((data) => {
      // Process the received IMU data
      console.log(data);
});

// Enable IMU at 30 Hz
wait sensorManager.writeSensorConfig(0, 30, 0); // 0 sensorId, 30 samplingRate
```

#### Play Audio
```js
// Play audio file from microSD card
openEarable.audioPlayer.wavFile(1, "music.wav"); // 1 state (play), music.wav file to play from microSD card   
```

#### Control RGB LED
```js
// TODO
```

## License
Distributed under the MIT License. See LICENSE for more information.

## Acknowledgements
- developed by the TECO research group at the Karlsruhe Institute of Technology
- icons by Bootstrap Icons
