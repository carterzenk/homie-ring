const RingDevice = require('./ring-device');
const { RingDeviceType } = require('ring-client-api');
const logger = require('../logger');

const ALARM_PROPS = {
    MODE: 'mode'
};

class SecurityPanel extends RingDevice {
    constructor(ringDevice) {
        super(ringDevice);
        this.alarmNode = null;
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
            logger.error('Received unsupported {alarmMode}', {
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

module.exports = SecurityPanel;