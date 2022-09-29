import {RingDevice} from './ring-device';
import {RingDeviceType, RingDevice as RingClientDevice} from 'ring-client-api';
import {Settings} from 'src/config';
import {Logger} from 'src/logger';
import HomieDevice from 'homie-device';

const ALARM_PROPS = {
    MODE: 'mode'
};

export class SecurityPanel extends RingDevice {
    private alarmNode: HomieDevice;

    constructor(
        logger: Logger,
        settings: Settings,
        ringDevice: RingClientDevice,
    ) {
        super(logger, settings, ringDevice);
        this.setAlarmNode();
    }

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.SecurityPanel;
    }

    setAlarmNode() {
        this.alarmNode = this.homieDevice.node('alarm', 'Alarm', 'alarm');

        this
            .alarmNode
            .advertise(ALARM_PROPS.MODE)
            .setName("Alarm Mode")
            .setRetained(true)
            .setDatatype('string')
            .settable((range, value) => {
                this.setAlarmMode(value);
            });
    }

    setAlarmMode(value) {
        if (['all', 'some', 'none'].indexOf(value) === -1) {
            this.logger.error('Received unsupported {alarmMode}', {
                alarmMode: value
            });

            return;
        }

        this.ringDevice.location.setAlarmMode(value).then(() => {
            this.publishAlarm();
        });
    }

    publishData() {
        super.publishData();
        this.publishAlarm();
    }

    publishAlarm() {
        const mode = this.ringDevice.data.mode;
        this.alarmNode.setProperty(ALARM_PROPS.MODE).send(mode);
    }
}
