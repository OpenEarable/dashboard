# 🦻 OpenEarable Dashboard
This repository offers comprehensive web interface for controlling and monitoring OpenEarable. The dashboard offers acces to different sensors, audio controls, button and the RGB LED of OpenEarable. In addition, it shows real-time graphs of accelerometer, gyroscope, magnetomer, pressure sensor, and temperature sensor data. Users can use the dashboard to label incoming data and download the labeled data as csv file ([edge-ml.org](https://edge-ml.org) compatible format).

This repository also includes the [OpenEarable.js](https://github.com/OpenEarable/dashboard#openearablejs-library) JavaScript library in the assets folder `assets/js/OpenEarable.js`.

## Usage

## OpenEarable.js Library
OpenEarable.js is a JavaScript library that provides a seamless interface to connect, manage, and interact with OpenEarable. The library abstracts the complexities of BLE communication, making it easy to fetch device details, manage sensors, LED, and audio, and subscribe to device state changes.

### Installation
To use OpenEarable.js simply integrate the library found under `assets/js/OpenEarable.js` into your project as follows.
```html
<script src="./OpenEarable.js"></script>
```

## License
Distributed under the MIT License. See LICENSE for more information.

## Acknowledgements
- developed by the TECO research group at the Karlsruhe Institute of Technology
- icons by Bootstrap Icons
