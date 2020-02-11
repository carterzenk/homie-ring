const RingDevice = require('./ring-device');

class SecurityKeypad extends RingDevice {

    static isSupported(deviceType) {
        return deviceType === "security-keypad";
    }
}

module.exports = SecurityKeypad;