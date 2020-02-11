const HomieDevice = require('homie-device');
const config = require('./config');
const mqttSettings = config.get().mqtt;

const createHomieDevice = (deviceId, name) => {
    return new HomieDevice({
        device_id: deviceId,
        name: name,
        mqtt: {
            ...mqttSettings,
            base_topic: mqttSettings.base_topic,
        }
    });
}

module.exports = {
    createHomieDevice: createHomieDevice
};