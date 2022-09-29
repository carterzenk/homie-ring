"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityPanel = void 0;
const ring_device_1 = require("./ring-device");
const ring_client_api_1 = require("ring-client-api");
const ALARM_PROPS = {
    MODE: 'mode'
};
class SecurityPanel extends ring_device_1.RingDevice {
    alarmNode;
    constructor(logger, settings, ringDevice) {
        super(logger, settings, ringDevice);
        this.setAlarmNode();
    }
    static isSupported(deviceType) {
        return deviceType === ring_client_api_1.RingDeviceType.SecurityPanel;
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
exports.SecurityPanel = SecurityPanel;
//# sourceMappingURL=security-panel.js.map