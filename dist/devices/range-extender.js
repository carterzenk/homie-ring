"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeExtender = void 0;
const ring_device_1 = require("./ring-device");
const ring_client_api_1 = require("ring-client-api");
class RangeExtender extends ring_device_1.RingDevice {
    static isSupported(deviceType) {
        return deviceType === ring_client_api_1.RingDeviceType.RangeExtender;
    }
}
exports.RangeExtender = RangeExtender;
//# sourceMappingURL=range-extender.js.map