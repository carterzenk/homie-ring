"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RingDevice = void 0;
const base_device_1 = require("./base-device");
var BatteryProps;
(function (BatteryProps) {
    BatteryProps["LEVEL"] = "level";
    BatteryProps["STATUS"] = "status";
})(BatteryProps || (BatteryProps = {}));
;
var ConnectionProps;
(function (ConnectionProps) {
    ConnectionProps["STATUS"] = "status";
})(ConnectionProps || (ConnectionProps = {}));
;
var TamperProps;
(function (TamperProps) {
    TamperProps["STATUS"] = "status";
})(TamperProps || (TamperProps = {}));
;
var AcProps;
(function (AcProps) {
    AcProps["STATUS"] = "status";
})(AcProps || (AcProps = {}));
;
class RingDevice extends base_device_1.BaseDevice {
    batteryNode = null;
    connectionNode = null;
    tamperNode = null;
    acNode = null;
    constructor(logger, settings, ringDevice) {
        super(logger, settings, ringDevice, ringDevice.id);
        this.setBatteryNode();
        this.setConnectionNode();
        this.setTamperNode();
        if (typeof ringDevice.data.acStatus !== undefined) {
            this.setAcNode();
        }
    }
    static isSupported(__deviceType) {
        return false;
    }
    setBatteryNode() {
        this.batteryNode = this.homieDevice.node('battery', 'Battery', 'power');
        if (this.ringDevice.data.batteryLevel !== undefined) {
            this
                .batteryNode
                .advertise(BatteryProps.LEVEL)
                .setName("Battery Level")
                .setRetained(true)
                .setDatatype('integer')
                .setUnit('%');
        }
        this
            .batteryNode
            .advertise(BatteryProps.STATUS)
            .setName("Battery Status")
            .setRetained(true)
            .setDatatype('string');
    }
    setConnectionNode() {
        this.connectionNode = this.homieDevice.node('connection', 'Connection', 'connection');
        this
            .connectionNode
            .advertise(ConnectionProps.STATUS)
            .setName("Connection Status")
            .setRetained(true)
            .setDatatype('string');
    }
    setTamperNode() {
        this.tamperNode = this.homieDevice.node('tamper', 'Tamper Sensor', 'tamper');
        this
            .tamperNode
            .advertise(TamperProps.STATUS)
            .setName("Tamper Status")
            .setRetained(true)
            .setDatatype('boolean');
    }
    setAcNode() {
        this.acNode = this.homieDevice.node('ac', 'AC', 'power');
        this
            .acNode
            .advertise(AcProps.STATUS)
            .setName("AC Power Status")
            .setRetained(true)
            .setDatatype('string');
    }
    publishData() {
        this.publishBattery();
        this.publishConnection();
        this.publishTamper();
        if (this.acNode !== null) {
            this.publishAc();
        }
    }
    publishBattery() {
        if (this.ringDevice.data.batteryLevel !== undefined) {
            const batteryLevel = `${this.ringDevice.data.batteryLevel}`;
            this.batteryNode.setProperty(BatteryProps.LEVEL).send(batteryLevel);
        }
        const battStatus = this.ringDevice.data.batteryStatus;
        this.batteryNode.setProperty(BatteryProps.STATUS).send(battStatus);
    }
    publishConnection() {
        const connStatus = this.ringDevice.data.status;
        this.connectionNode.setProperty(ConnectionProps.STATUS).send(connStatus);
    }
    publishTamper() {
        const tamperStatus = this.ringDevice.data.tamperStatus === 'tamper' ? 'true' : 'false';
        this.tamperNode.setProperty(TamperProps.STATUS).send(tamperStatus);
    }
    publishAc() {
        const acStatus = this.ringDevice.data.acStatus;
        this.acNode.setProperty(AcProps.STATUS).send(acStatus);
    }
}
exports.RingDevice = RingDevice;
//# sourceMappingURL=ring-device.js.map