class OpenEarable {
    constructor() {
        this.bleManager = new BLEManager();
        this.sensorManager = new SensorManager(this.bleManager);
        this.rgbLed = new RGBLed(this.bleManager);
        this.audioPlayer = new AudioPlayer(); 
    }

    async readDeviceIdentifier() {
        this.bleManager.ensureConnected();
        const value = await this.bleManager.readValue('45622510-6468-465a-b141-0b9b0f96b468', '45622511-6468-465a-b141-0b9b0f96b468');
        return new TextDecoder().decode(value);
    }

    async readDeviceGeneration() {
        this.bleManager.ensureConnected();
        const value = await this.bleManager.readValue('45622510-6468-465a-b141-0b9b0f96b468', '45622512-6468-465a-b141-0b9b0f96b468');
        return new TextDecoder().decode(value);
    }
}

class BLEManager {
    constructor() {
        this.device = null;
        this.gattServer = null;
        this.onConnect = null;
        this.onDisconnect = null;
    }

    async connect() {
        try {
            console.log("connecting")
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '45622510-6468-465a-b141-0b9b0f96b468', // Device Info Service
                    '81040a2e-4819-11ee-be56-0242ac120002', // LED Service
                    '34c2e3bb-34aa-11eb-adc1-0242ac120002', // Sensor Service
                    '29c10bdc-4773-11ee-be56-0242ac120002'  // Button Service
                    // TODO: add remaining services
                ]
            });
            this.gattServer = await this.device.gatt.connect();
            
            this.device.addEventListener('gattserverdisconnected', () => {
                this.cleanup();
                if (this.onDisconnect) {
                    this.onDisconnect();
                }
            });

            alert(this.onConnect)

            if (this.onConnect) {
                this.onConnect();
            }
        } catch (error) {
            console.error("Error connecting to BLE device:", error);
        }
    }

    async disconnect() {
        if (this.device) {
            this.device.gatt.disconnect();
        }
    }

    cleanup() {
        this.device = null;
        this.gattServer = null;
    }

    ensureConnected() {
        if (!this.device || !this.device.gatt.connected) {
            throw new Error("No BLE device connected.");
        }
    }

    async readValue(serviceUUID, characteristicUUID) {
        this.ensureConnected();
        try {
            const service = await this.gattServer.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            const value = await characteristic.readValue();
            return value; 
        } catch (error) {
            console.error('Error reading value:', error);
        }
    }

    async writeValue(serviceUUID, characteristicUUID, data) {
        this.ensureConnected();
        try {
            const service = await this.gattServer.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            await characteristic.writeValue(data);
        } catch (error) {
            console.error('Error writing value:', error);
        }
    }
}

class RGBLed {
    constructor(bleManager) {
        this.bleManager = bleManager;
    }

    async writeLedColor(r, g, b) {
        this.bleManager.ensureConnected();
        alert("set rgb color")
        const data = new Uint8Array([r, g, b]);
        await this.bleManager.writeValue('81040a2e-4819-11ee-be56-0242ac120002', '81040e7a-4819-11ee-be56-0242ac120002', data);
    }
}

class SensorManager {
    constructor(bleManager) {
        this.bleManager = bleManager;
    }

    async writeSensorConfig(sensorId, samplingRate, latency) {
        this.bleManager.ensureConnected();
        const data = new ArrayBuffer(9); 
        const view = new DataView(data);
        view.setUint8(0, sensorId);
        view.setFloat32(1, samplingRate, true); 
        view.setUint32(5, latency, true);       
        await this.bleManager.writeValue('34c2e3bb-34aa-11eb-adc1-0242ac120002', '34c2e3bd-34aa-11eb-adc1-0242ac120002', data);
    }
}

class AudioPlayer {
    // This class remains unchanged for now
}

const AudioState = {
    Play: 'PLAY',
    Pause: 'PAUSE',
    Stop: 'STOP'
};