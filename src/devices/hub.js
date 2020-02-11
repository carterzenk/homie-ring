const RingDevice = require('./ring-device');
const { RingDeviceType } = require('ring-client-api');

const BATTERY_PROPS = {
    STATUS: 'status'
};

class Hub extends RingDevice {

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.BaseStation;
    }
        
}

module.exports = Hub;