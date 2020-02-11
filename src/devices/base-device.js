const { createHomieDevice } = require('../homie');
const logger = require('../logger');

class BaseDevice {
    constructor(ringDevice, uniqueId) {
        this.publishData = this.publishData.bind(this);
        this.ringDevice = ringDevice;
        this.homieDevice = createHomieDevice(
            uniqueId,
            ringDevice.name
        );

        this.homieDevice.on('connect', () => {
            this.publishData();
            
            this.ringDevice.onData.subscribe((data) => {
                logger.debug("Received data update from {deviceId}", {
                    deviceId: this.ringDevice.id,
                    deviceName: this.ringDevice.name,
                    data: data
                });
                
                this.publishData();
            });
        });
    }

    publishData() {}

    start() {
        return new Promise((resolve) => {
            logger.debug('Connecting to MQTT broker for {deviceId}...', {
                deviceId: this.ringDevice.id
            });
            this.homieDevice.once('connect', resolve);
            this.homieDevice.setup(true);
            this.homieDevice.mqttClient.on('error', (err) => {
                logger.error("Encountered MQTT error.", { error: err });
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            logger.debug('Disconnecting from MQTT broker for {deviceId}...', {
                deviceId: this.ringDevice.id
            });
        
            this.homieDevice.once('disconnect', resolve);
            this.homieDevice.end();
        });
    }
}

module.exports = BaseDevice;