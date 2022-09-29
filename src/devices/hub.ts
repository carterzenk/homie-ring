import {RingDevice} from './ring-device';
import {RingDeviceType } from 'ring-client-api';

export class Hub extends RingDevice {

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.BaseStation;
    }
        
}
