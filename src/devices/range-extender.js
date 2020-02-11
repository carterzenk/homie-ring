const RingDevice = require('./ring-device');
const { RingDeviceType } = require('ring-client-api');

class RangeExtender extends RingDevice {

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.RangeExtender;
    }
}

module.exports = RangeExtender;