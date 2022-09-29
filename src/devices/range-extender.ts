import {RingDevice} from './ring-device';
import {RingDeviceType} from 'ring-client-api';

export class RangeExtender extends RingDevice {

    static isSupported(deviceType: RingDeviceType) {
        return deviceType === RingDeviceType.RangeExtender;
    }
}
