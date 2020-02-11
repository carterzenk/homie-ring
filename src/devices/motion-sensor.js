const RingDevice = require('./ring-device');
const { RingDeviceType } = require('ring-client-api');

const SENSOR_PROPS = {
    MOTION: 'motion',
    TAMPER: 'tamper'
};

class MotionSensor extends RingDevice {
    constructor(ringDevice) {
        super(ringDevice);
        this.sensorNode = null;
        this.setSensorNode();
    }

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.MotionSensor;
    }

    setSensorNode() {
        this.sensorNode = this.homieDevice.node('sensor', 'Motion Sensor', 'motion');

        this
            .sensorNode
            .advertise(SENSOR_PROPS.MOTION)
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
        this.sensorNode.setProperty(SENSOR_PROPS.MOTION).send(motion);
    }
}

module.exports = MotionSensor;