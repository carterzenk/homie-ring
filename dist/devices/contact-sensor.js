"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSensor = void 0;
const ring_device_1 = require("./ring-device");
const ring_client_api_1 = require("ring-client-api");
const SensorProps = {
    CONTACT: 'contact',
    TAMPER: 'tamper'
};
class ContactSensor extends ring_device_1.RingDevice {
    sensorNode = null;
    constructor(logger, settings, ringDevice) {
        super(logger, settings, ringDevice);
        this.setSensorNode();
    }
    static isSupported(deviceType) {
        return deviceType === ring_client_api_1.RingDeviceType.ContactSensor;
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
exports.ContactSensor = ContactSensor;
//# sourceMappingURL=contact-sensor.js.map