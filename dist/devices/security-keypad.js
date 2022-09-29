"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityKeypad = void 0;
const ring_device_1 = require("./ring-device");
class SecurityKeypad extends ring_device_1.RingDevice {
    static isSupported(deviceType) {
        return deviceType === "security-keypad";
    }
}
exports.SecurityKeypad = SecurityKeypad;
//# sourceMappingURL=security-keypad.js.map