import {RingDevice} from './ring-device';

export class SecurityKeypad extends RingDevice {

    static isSupported(deviceType) {
        return deviceType === "security-keypad";
    }
}
