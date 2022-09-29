import {RingDevice} from './ring-device';
import {RingDeviceType} from 'ring-client-api';

const SensorProps = {
    CONTACT: 'contact',
    TAMPER: 'tamper'
};

export class ContactSensor extends RingDevice {
    private sensorNode = null;

    constructor(logger, settings, ringDevice) {
        super(logger, settings, ringDevice);

        this.setSensorNode();
    }

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.ContactSensor;
    }

    setSensorNode() {
        this.sensorNode = this.homieDevice.node('sensor', 'Contact Sensor', 'contact');

        this
            .sensorNode
            .advertise(SensorProps.CONTACT)
            .setName("Contact")
            .setRetained(true)
            .setDatatype('boolean');
    }

    publishData() {
        super.publishData();
        this.publishSensor();
    }

    publishSensor() {
        const contact = this.ringDevice.data.faulted ? 'false' : 'true';
        this.sensorNode.setProperty(SensorProps.CONTACT).send(contact);
    }
}
