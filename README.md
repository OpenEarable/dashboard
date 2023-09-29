# 🦻 OpenEarable Dashboard
This repository offers comprehensive web interface for controlling and monitoring OpenEarable. The dashboard offers acces to different sensors, audio controls, button events and the RGB LED of OpenEarable. In addition, it shows real-time graphs of accelerometer, gyroscope, magnetomer, pressure, and temperature sensor data. Users can use the dashboard to label incoming data and download the labeled data as csv file ([edge-ml.org](https://edge-ml.org) compatible format for no-code machine learning).

This repository also includes the [OpenEarable.js](https://github.com/OpenEarable/dashboard#openearablejs-library) JavaScript library in the `assets/js/OpenEarable.js` folder. This way, researchers and developers can easily integrate OpenEarable into their own workflows.

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
OpenEarable allows playing mono, 16-bit, 44.1kHz *.wav files from the internal microSD card. In addition, it is possible to generate a constant frequency on the earable directly or play one of the built-in jingles.

```js
// Play audio file from microSD card with the name "music.wav"
openEarable.audioPlayer.wavFile(AUDIO_STATE.PLAY, "music.wav");

// Play a constant frequency sine wave at 22 kHz
openEarable.audioPlayer.wavFile(AUDIO_STATE.PLAY, WAVE_TYPE.SINE, 22000);

// Play a default "NOTIFICATION" jingle from the internal OpenEarable storage
openEarable.audioPlayer.jingle(AUDIO_STATE.PLAY, "NOTIFICATION");
```

#### Control RGB LED
```js
openEarable.
```

## License
Distributed under the MIT License. See LICENSE for more information.

## Acknowledgements
- developed by the TECO research group at the Karlsruhe Institute of Technology
- icons by Bootstrap Icons
