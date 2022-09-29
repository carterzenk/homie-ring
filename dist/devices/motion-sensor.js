"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionSensor = void 0;
const ring_client_api_1 = require("ring-client-api");
const ring_device_1 = require("./ring-device");
const SensorProps = {
    MOTION: 'motion',
    TAMPER: 'tamper'
};
class MotionSensor extends ring_device_1.RingDevice {
    sensorNode;
    constructor(logger, settings, ringDevice) {
        super(logger, settings, ringDevice);
        this.sensorNode = null;
        this.setSensorNode();
    }
    static isSupported(deviceType) {
        return deviceType === ring_client_api_1.RingDeviceType.MotionSensor;
    }
    setSensorNode() {
        this.sensorNode = this.homieDevice.node('sensor', 'Motion Sensor', 'motion');
        this
            .sensorNode
            .advertise(SensorProps.MOTION)
            .setName("Motion")
            .setRetained(true)
            .setDatatype('boolean');
    }
    publishData() {
        super.publishData();
        this.publishSensor();
    }
    publishSensor() {
        const motion = this.ringDevice.data.faulted ? 'true' : 'false';
        this.sensorNode.setProperty(SensorProps.MOTION).send(motion);
    }
}
exports.MotionSensor = MotionSensor;
//# sourceMappingURL=motion-sensor.js.map