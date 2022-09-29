import HomieNode from 'homie-device/lib/HomieNode';
import {Logger} from 'src/logger';
import {RingDeviceType, RingDevice as RingClientDevice} from 'ring-client-api';
import {RingDevice} from './ring-device';
import {Settings} from 'src/config';

const SensorProps = {
    MOTION: 'motion',
    TAMPER: 'tamper'
};

export class MotionSensor extends RingDevice {
    private sensorNode: HomieNode;

    constructor(
        logger: Logger,
        settings: Settings,
        ringDevice: RingClientDevice,
    ) {
        super(logger, settings, ringDevice);
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
