const RingDevice = require('./ring-device');
const { RingDeviceType } = require('ring-client-api');

const SENSOR_PROPS = {
    CONTACT: 'contact',
    TAMPER: 'tamper'
};

class ContactSensor extends RingDevice {
    constructor(ringDevice) {
        super(ringDevice);

        this.sensorNode = null;

        this.setSensorNode();
    }

    static isSupported(deviceType) {
        return deviceType === RingDeviceType.ContactSensor;
    }

    setSensorNode() {
        this.sensorNode = this.homieDevice.node('sensor', 'Contact Sensor', 'contact');

        this
            .sensorNode
            .advertise(SENSOR_PROPS.CONTACT)
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
        this.sensorNode.setProperty(SENSOR_PROPS.CONTACT).send(contact);
    }
}

module.exports = ContactSensor;