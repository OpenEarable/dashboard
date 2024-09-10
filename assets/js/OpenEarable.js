/**
 * Enumeration of different battery states.
 */
const BATTERY_STATE = {
    CHARGING: 0,
    CHARGED: 1,
    NOT_CHARGING: 2
}

/**
 * Enumeration of different sensor ids.
 */
const SENSOR_ID = {
    IMU: 0,
    PRESSURE_SENSOR: 1,
    MICROPHONE: 2
}

/**
 * Enumeration for different audio states.
 */
const AUDIO_STATE = {
    IDLE: 0,
    PLAY: 1,
    PAUSE: 2,
    STOP: 3
};

/**
 * Enumeration for different jingles.
 */
const JINGLE = {
    IDLE: 0,
    NOTIFICATION: 1,
    SUCCESS: 2,
    ERROR: 3,
    ALARM: 4,
    PING: 5,
    OPEN: 6,
    CLOSE: 7,
    CLICK: 8
};

/**
 * Enumeration for different wave types.
 */
const WAVE_TYPE = {
    IDLE: 0,
    SINE: 1,
    SQUARE: 2,
    TRIANGLE: 3,
    SAW: 4
};

/**
 * Dictionary of the different OpenEarable BLE services.
 */
const SERVICES = {
    DEVICE_INFO_SERVICE: {
        UUID: '45622510-6468-465a-b141-0b9b0f96b468',
        CHARACTERISTICS: {
            DEVICE_IDENTIFIER_CHARACTERISTIC: {
                UUID: '45622511-6468-465a-b141-0b9b0f96b468'
            },
            FIRMWARE_REVISION_CHARACTERISTIC: {
                UUID: '45622512-6468-465a-b141-0b9b0f96b468'
            },
            HARDWARE_GENERATION_CHARACTERISTIC: {
                UUID: '45622513-6468-465a-b141-0b9b0f96b468'
            }
        }
    },
    BATTERY_SERVICE: {
        UUID: '0000180f-0000-1000-8000-00805f9b34fb',
        CHARACTERISTICS: {
            BATTERY_LEVEL_CHARACTERISTIC: {
                UUID: '00002a19-0000-1000-8000-00805f9b34fb'
            }, 
            BATTERY_STATE_CHARACTERISTIC: {
                UUID: '00002a1a-0000-1000-8000-00805f9b34fb'
            }
        }
    },
    PARSE_INFO_SERVICE: {
        UUID: 'caa25cb7-7e1b-44f2-adc9-e8c06c9ced43',
        CHARACTERISTICS: {
            SCHEME_CHARACTERISTIC: {
                UUID: 'caa25cb8-7e1b-44f2-adc9-e8c06c9ced43'
            }
        }
    },
    SENSOR_SERVICE: {
        UUID: '34c2e3bb-34aa-11eb-adc1-0242ac120002',
        CHARACTERISTICS: {
            SENSOR_CONFIGURATION_CHARACTERISTIC: {
                UUID: '34c2e3bd-34aa-11eb-adc1-0242ac120002'
            },
            SENSOR_DATA_CHARACTERISTIC: {
                UUID: '34c2e3bc-34aa-11eb-adc1-0242ac120002'
            }
        }
    },
    BUTTON_SERVICE: {
        UUID: '29c10bdc-4773-11ee-be56-0242ac120002',
        CHARACTERISTICS: {
            BUTTON_STATE_CHARACTERISTIC: {
                UUID: '29c10f38-4773-11ee-be56-0242ac120002'
            }
        }
    },
    LED_SERVICE: {
        UUID: '81040a2e-4819-11ee-be56-0242ac120002',
        CHARACTERISTICS: {
            LED_STATE_CHARACTERISTIC: {
                UUID: '81040e7a-4819-11ee-be56-0242ac120002'
            }
        }
    },
    AUDIO_SERVICE: {
        UUID: '5669146e-476d-11ee-be56-0242ac120002',
        CHARACTERISTICS: {
            AUDIO_SOURCE_CHARACTERISTIC: {
                UUID: '566916a8-476d-11ee-be56-0242ac120002'
            },
            AUDIO_STATE_CHARACTERISTIC: {
                UUID: '566916a9-476d-11ee-be56-0242ac120002'
            }
        }
    }
}


class OpenEarable {
    constructor() {
        this.bleManager = new BLEManager();
        this.sensorManager = new SensorManager(this.bleManager);
        this.rgbLed = new RGBLed(this.bleManager);
        this.audioPlayer = new AudioPlayer(this.bleManager);
        this.buttonManager = new ButtonManager(this.bleManager)
        this.firmwareVersion = undefined;
        this.hardwareVersion = undefined;

        // Attach event listeners for BLEManager
        this.bleManager.subscribeOnConnected(this.onDeviceReady.bind(this));

        this.batteryLevelChangedSubscribers = [];
        this.batteryStateChangedSubscribers = [];
    }

    async readDeviceIdentifier() {
        this.bleManager.ensureConnected();
        const value = await this.bleManager.readCharacteristic(
            SERVICES.DEVICE_INFO_SERVICE.UUID,
            SERVICES.DEVICE_INFO_SERVICE.CHARACTERISTICS.DEVICE_IDENTIFIER_CHARACTERISTIC.UUID
        );
        return new TextDecoder().decode(value);
    }
    
    async readFirmwareVersion() {
        this.bleManager.ensureConnected();
        const value = await this.bleManager.readCharacteristic(
            SERVICES.DEVICE_INFO_SERVICE.UUID,
            SERVICES.DEVICE_INFO_SERVICE.CHARACTERISTICS.FIRMWARE_REVISION_CHARACTERISTIC.UUID
        );
        return new TextDecoder().decode(value);
    }

    async readHardwareVersion() {
        this.bleManager.ensureConnected();
        const value = await this.bleManager.readCharacteristic(
            SERVICES.DEVICE_INFO_SERVICE.UUID,
            SERVICES.DEVICE_INFO_SERVICE.CHARACTERISTICS.HARDWARE_GENERATION_CHARACTERISTIC.UUID
        );
        return new TextDecoder().decode(value);
    }
    

    subscribeBatteryLevelChanged(callback) {
        this.batteryLevelChangedSubscribers.push(callback);
    }

    subscribeBatteryStateChanged(callback) {
        this.batteryStateChangedSubscribers.push(callback);
    }

    notifyBatteryLevelChanged(value) {
        if (!value) return;

        const batteryLevel = new DataView(value.buffer).getUint8(0);
        this.batteryLevelChangedSubscribers.forEach(callback => callback(batteryLevel));
    }

    notifyBatteryStateChanged(value) {
        if (!value) return;

        const batteryState = new DataView(value.buffer).getUint8(0);
        this.batteryStateChangedSubscribers.forEach(callback => callback(batteryState));
    }

    async onDeviceReady() {
        const batteryLevelValue = await this.bleManager.readCharacteristic(SERVICES.BATTERY_SERVICE.UUID, SERVICES.BATTERY_SERVICE.CHARACTERISTICS.BATTERY_LEVEL_CHARACTERISTIC.UUID);
        this.notifyBatteryLevelChanged(batteryLevelValue);

        this.firmwareVersion = await this.readFirmwareVersion();
        this.hardwareVersion = await this.readHardwareVersion();

        await this.bleManager.subscribeCharacteristicNotifications(
            SERVICES.BATTERY_SERVICE.UUID,
            SERVICES.BATTERY_SERVICE.CHARACTERISTICS.BATTERY_LEVEL_CHARACTERISTIC.UUID,
            (notificationEvent) => {
                this.notifyBatteryLevelChanged(notificationEvent.srcElement.value);
            }
        );
            

        const batteryStateValue = await this.bleManager.readCharacteristic(SERVICES.BATTERY_SERVICE.UUID, SERVICES.BATTERY_SERVICE.CHARACTERISTICS.BATTERY_STATE_CHARACTERISTIC.UUID);
        this.notifyBatteryStateChanged(batteryStateValue);
    
        await this.bleManager.subscribeCharacteristicNotifications(
            SERVICES.BATTERY_SERVICE.UUID, 
            SERVICES.BATTERY_SERVICE.CHARACTERISTICS.BATTERY_STATE_CHARACTERISTIC.UUID,
            (notificationEvent) => {
                this.notifyBatteryStateChanged(notificationEvent.srcElement.value);
            }
        );

        this.sensorManager.init();
        this.buttonManager.init();
    }    
}

class BLEManager {
    constructor() {
        this.device = null;
        this.gattServer = null;
        this.onConnectedSubscribers = [];
        this.onDisconnectedSubscribers = [];
        this.queue = [];
        this.operationInProgress = false;
    }

    async _executeNextOperation() {
        if (this.queue.length === 0 || this.operationInProgress) {
            return;
        }
        const nextOperation = this.queue.shift();
        this.operationInProgress = true;
        try {
            await nextOperation();
        } catch (error) {
            console.error('Error during GATT operation:', error);
        } finally {
            this.operationInProgress = false;
            this._executeNextOperation();
        }
    }

    async _enqueueOperation(operation) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await operation();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this._executeNextOperation();
        });
    }

    async connect() {
        return this._enqueueOperation(async () => {
            const optionalServiceUUIDs = Object.keys(SERVICES).map((service) => SERVICES[service].UUID);

            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: "OpenEarable" }
                ],
                acceptAllDevices: false,
                optionalServices: optionalServiceUUIDs
            });
            this.gattServer = await this.device.gatt.connect();
            if (!this.device.disconnectHandlerAdded) {
                this.device.addEventListener('gattserverdisconnected', this.handleDisconnected.bind(this));
                this.device.disconnectHandlerAdded = true;
            }
            
            this.notifyAll(this.onConnectedSubscribers);
        });
    }


    subscribeOnConnected(callback) {
        this.onConnectedSubscribers.push(callback);
    }
    

    subscribeOnDisconnected(callback) {
        this.onDisconnectedSubscribers.push(callback);
    }

    notifyAll(subscribers) {
        for(let callback of subscribers) {
            callback();
        }
    }

    async disconnect() {
        if (this.device) {
            this.device.gatt.disconnect();
        }
    }

    cleanup() {
        if (this.device) {
            this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
        }
        this.device = null;
        this.gattServer = null;
    }

    handleDisconnected() {
        this.cleanup();
        setTimeout(() => {
            this.notifyAll(this.onDisconnectedSubscribers);
        },
            6000); // make sure that system has cleaned up everything by delaying a bit
        
    }
    

    ensureConnected() {
        if (!this.device ||  !this.gattServer || !this.device.gatt.connected) {
            throw new Error("No BLE device connected.");
        }
    }

    async readCharacteristic(serviceUUID, characteristicUUID) {
        return this._enqueueOperation(async () => {
            this.ensureConnected();
            const service = await this.gattServer.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            const value = await characteristic.readValue();
            return value; 
        });
    }

    async writeCharacteristic(serviceUUID, characteristicUUID, data) {
        return this._enqueueOperation(async () => {
            this.ensureConnected();
            const service = await this.gattServer.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            await characteristic.writeValue(data);
        });
    }

    async subscribeCharacteristicNotifications(serviceUUID, characteristicUUID, callback) {
        return this._enqueueOperation(async () => {
            this.ensureConnected();
            const service = await this.gattServer.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', callback);
        });
    }
}


class RGBLed {
    constructor(bleManager) {
        this.bleManager = bleManager;
    }

    async writeLedColor(r, g, b) {
        this.bleManager.ensureConnected();
        const data = new Uint8Array([r, g, b]);
        await this.bleManager.writeCharacteristic(
            SERVICES.LED_SERVICE.UUID,
            SERVICES.LED_SERVICE.CHARACTERISTICS.LED_STATE_CHARACTERISTIC.UUID,
            data
        );
    }    
}

class SensorManager {
    constructor(bleManager) {
        this.bleManager = bleManager;
        this.sensorSchemes = null;
        this.onSensorDataReceivedSubscriber = []
    }

    async init() {
        const data = await this.bleManager.readCharacteristic(
            SERVICES.PARSE_INFO_SERVICE.UUID,
            SERVICES.PARSE_INFO_SERVICE.CHARACTERISTICS.SCHEME_CHARACTERISTIC.UUID
        );
        const byteStream = new Uint8Array(data.buffer);
    
        let currentIndex = 0;
    
        const numSensors = byteStream[currentIndex++];
        const tempSensorSchemes = [];
        for (let i = 0; i < numSensors; i++) {
            const sensorId = byteStream[currentIndex++];
    
            const nameLength = byteStream[currentIndex++];
            const nameBytes = byteStream.slice(currentIndex, currentIndex + nameLength);
            const sensorName = new TextDecoder().decode(nameBytes);
            currentIndex += nameLength;
    
            const componentCount = byteStream[currentIndex++];
            const sensorScheme = new SensorScheme(sensorId, sensorName, componentCount);
    
            for (let j = 0; j < componentCount; j++) {
                const componentType = byteStream[currentIndex++];
    
                const groupNameLength = byteStream[currentIndex++];
                const groupNameBytes = byteStream.slice(currentIndex, currentIndex + groupNameLength);
                const groupName = new TextDecoder().decode(groupNameBytes);
                currentIndex += groupNameLength;
    
                const componentNameLength = byteStream[currentIndex++];
                const componentNameBytes = byteStream.slice(currentIndex, currentIndex + componentNameLength);
                const componentName = new TextDecoder().decode(componentNameBytes);
                currentIndex += componentNameLength;
    
                const unitNameLength = byteStream[currentIndex++];
                const unitNameBytes = byteStream.slice(currentIndex, currentIndex + unitNameLength);
                const unitName = new TextDecoder().decode(unitNameBytes);
                currentIndex += unitNameLength;
    
                const component = new Component(componentType, groupName, componentName, unitName);
                sensorScheme.components.push(component);
            }
    
            tempSensorSchemes.push(sensorScheme);
        }
        this.sensorSchemes = tempSensorSchemes;


        await this.bleManager.subscribeCharacteristicNotifications(
            SERVICES.SENSOR_SERVICE.UUID,
            SERVICES.SENSOR_SERVICE.CHARACTERISTICS.SENSOR_DATA_CHARACTERISTIC.UUID,
            async (data) => {
                var parsedData = await this.parseData(data.srcElement.value);
                for(let callback of this.onSensorDataReceivedSubscriber) {
                    callback(parsedData);
                }
            }
        );        
    }

    async writeSensorConfig(sensorId, samplingRate, latency) {
        this.bleManager.ensureConnected();
        const data = new ArrayBuffer(9); 
        const view = new DataView(data);
        view.setUint8(0, sensorId);
        view.setFloat32(1, samplingRate, true); 
        view.setUint32(5, latency, true); 
        console.log("Writing Sensor Config")
        console.log(data)   
        await this.bleManager.writeCharacteristic(
            SERVICES.SENSOR_SERVICE.UUID,
            SERVICES.SENSOR_SERVICE.CHARACTERISTICS.SENSOR_CONFIGURATION_CHARACTERISTIC.UUID,
            data
        );        
    }
    
    async parseData(data) {
        const ParseType = {
            int8: 0,
            uint8: 1,
            int16: 2,
            uint16: 3,
            int32: 4,
            uint32: 5,
            float: 6,
            double: 7
        };

        const byteData = new DataView(data.buffer);
        let byteIndex = 0;
        const sensorId = byteData.getUint8(byteIndex);
        byteIndex += 2;
        const timestamp = byteData.getUint32(byteIndex, true); // true means little-endian
        byteIndex += 4;
        const parsedData = {};
    
        const foundScheme = this.sensorSchemes.find(scheme => scheme.sensorId === sensorId);
        parsedData.sensorId = sensorId;
        parsedData.timestamp = timestamp;
        parsedData.sensorName = foundScheme.sensorName;
        parsedData.rawByteData = byteData;
    
        for (const component of foundScheme.components) {
            if (!parsedData[component.groupName]) {
                parsedData[component.groupName] = {};
            }
            if (!parsedData[component.groupName].units) {
                parsedData[component.groupName].units = {};
            }
    
            let parsedValue;
            switch (component.type) {
                case ParseType.int8:
                    parsedValue = byteData.getInt8(byteIndex);
                    byteIndex += 1;
                    break;
                case ParseType.uint8:
                    parsedValue = byteData.getUint8(byteIndex);
                    byteIndex += 1;
                    break;
                case ParseType.int16:
                    parsedValue = byteData.getInt16(byteIndex, true);
                    byteIndex += 2;
                    break;
                case ParseType.uint16:
                    parsedValue = byteData.getUint16(byteIndex, true);
                    byteIndex += 2;
                    break;
                case ParseType.int32:
                    parsedValue = byteData.getInt32(byteIndex, true);
                    byteIndex += 4;
                    break;
                case ParseType.uint32:
                    parsedValue = byteData.getUint32(byteIndex, true);
                    byteIndex += 4;
                    break;
                case ParseType.float:
                    parsedValue = byteData.getFloat32(byteIndex, true);
                    byteIndex += 4;
                    break;
                case ParseType.double:
                    parsedValue = byteData.getFloat64(byteIndex, true);
                    byteIndex += 8;
                    break;
            }
    
            parsedData[component.groupName][component.componentName] = parsedValue;
            parsedData[component.groupName].units[component.componentName] = component.unitName;
        }

        
        return parsedData;
    }
    
    subscribeOnSensorDataReceived(callback) {
        this.onSensorDataReceivedSubscriber.push(callback);
    }


}

class Component {
    constructor(type, groupName, componentName, unitName) {
        this.type = type;
        this.groupName = groupName;
        this.componentName = componentName;
        this.unitName = unitName;
    }

    toString() {
        return `Component(type: ${this.type}, groupName: ${this.groupName}, componentName: ${this.componentName}, unitName: ${this.unitName})`;
    }
}

class SensorScheme {
    constructor(sensorId, sensorName, componentCount) {
        this.sensorId = sensorId;
        this.sensorName = sensorName;
        this.componentCount = componentCount;
        this.components = [];
    }

    toString() {
        return `SensorScheme(sensorId: ${this.sensorId}, sensorName: ${this.sensorName}, components: ${this.components.map(component => component.toString())})`;
    }
}

class OpenEarableSensorConfig {
    // The constructor initializes the properties.
    constructor({ sensorId, samplingRate, latency }) {
        this.sensorId = sensorId;         // 8-bit unsigned integer
        this.samplingRate = samplingRate; // 4-byte float
        this.latency = latency;           // 32-bit unsigned integer
    }

    // Returns a byte list representing the sensor configuration for writing to the device.
    get byteList() {
        const buffer = new ArrayBuffer(9); // 9 bytes in total
        const data = new DataView(buffer);
        data.setUint8(0, this.sensorId);
        data.setFloat32(1, this.samplingRate, true); // true for little-endian
        data.setUint32(5, this.latency, true);      // true for little-endian
        
        // Convert ArrayBuffer to Uint8Array and then to regular array
        return Array.from(new Uint8Array(buffer));
    }

    // String representation of the object.
    toString() {
        return `OpenEarableSensorConfig(sensorId: ${this.sensorId}, sampleRate: ${this.samplingRate}, latency: ${this.latency})`;
    }
}




/**
 * Represents an audio player that communicates with BLE devices.
 */
class AudioPlayer {
    
    /**
     * Create an AudioPlayer instance.
     * @param {Object} bleManager - BLE manager to handle communications with the device.
     */
    constructor(bleManager) {
        this.bleManager = bleManager;
    }

    /**
     * Send WAV file details to the BLE device.
     * @param {string} fileName - Name of the WAV file.
     * @returns {Promise} Resolves when data is written, rejects otherwise.
     */
    async wavFile(fileName) {
        try {
            let type = 1;  // 1 indicates it's a WAV file
            let data = this.prepareData(type, fileName);
            await this.bleManager.writeCharacteristic(
                SERVICES.AUDIO_SERVICE.UUID,
                SERVICES.AUDIO_SERVICE.CHARACTERISTICS.AUDIO_SOURCE_CHARACTERISTIC.UUID,
                data
            );            
        } catch (error) {
            log("Error writing wavFile data: " + error, "ERROR");
        }
    }

    /**
     * Send frequency details to the BLE device.
     * @param {number} waveType - Type of wave (0 for sine, 1 for triangle, etc.).
     * @param {number} frequency - Frequency value.
     * @param {number} loudness - Controls the loudness of the sound.
     * @returns {Promise} Resolves when data is written, rejects otherwise.
     */
    async frequency(waveType, frequency, loudness) {
        try {
            let type = 2;  // 2 indicates it's a frequency
            let data = new Uint8Array(10);
            data[0] = type;
            data[1] = waveType; 
            
            let freqBytes = new Float32Array([frequency]);
            let loudnessBytes = new Float32Array([loudness]);
            data.set(new Uint8Array(freqBytes.buffer), 2);
            data.set(new Uint8Array(loudnessBytes.buffer), 6);

            await this.bleManager.writeCharacteristic(
                SERVICES.AUDIO_SERVICE.UUID,
                SERVICES.AUDIO_SERVICE.CHARACTERISTICS.AUDIO_SOURCE_CHARACTERISTIC.UUID,
                data
            );            
        } catch (error) {
            log("Error writing frequency data: " + error, "ERROR");
        }
    }

    /**
     * Send jingle details to the BLE device.
     * @param {number} jingleId- Id of the jingle.
     * @returns {Promise} Resolves when data is written, rejects otherwise.
     */
    async jingle(jingleId) {
        try {
            let type = 3;  // 3 indicates it's a jingle
            let data = new Uint8Array(2);
            data[0] = type;
            data[1] = jingleId; 
            await this.bleManager.writeCharacteristic(
                SERVICES.AUDIO_SERVICE.UUID,
                SERVICES.AUDIO_SERVICE.CHARACTERISTICS.AUDIO_SOURCE_CHARACTERISTIC.UUID,
                data
            );            
        } catch (error) {
            log("Error writing jingle data: " + error, "ERROR");
        }
    }

    /**
     * Prepares the data buffer to send to the BLE device.
     * @param {number} type - Type of audio data.
     * @param {string} name - Name of the audio file or jingle.
     * @returns {Uint8Array} Data buffer ready to send.
     */
    prepareData(type, name) {
        const nameBytes = new TextEncoder().encode(name);
        let data = new Uint8Array(2 + nameBytes.length);
        data[0] = type;
        data[1] = nameBytes.length;
        data.set(nameBytes, 2);
        return data;
    }

    async setState(state) {
        let data = new Uint8Array(1);
        data[0] = state;
        await this.bleManager.writeCharacteristic(
            SERVICES.AUDIO_SERVICE.UUID,
            SERVICES.AUDIO_SERVICE.CHARACTERISTICS.AUDIO_STATE_CHARACTERISTIC.UUID,
            data
        );  
    }
}


class ButtonManager {
    constructor(bleManager) {
        this.bleManager = bleManager;
        this.buttonStateChangedSubscribers = [];
    }

    subscribeOnButtonStateChanged(callback) {
        this.buttonStateChangedSubscribers.push(callback);
    }

    init() {
        this.bleManager.subscribeCharacteristicNotifications(SERVICES.BUTTON_SERVICE.UUID, SERVICES.BUTTON_SERVICE.CHARACTERISTICS.BUTTON_STATE_CHARACTERISTIC.UUID, (notification) => {
            this.buttonStateChangedSubscribers.forEach(callback => callback(new DataView(notification.srcElement.value.buffer).getUint8(0)));
        });
    }
}
