const BaseDevice = require('./base-device');

const BATTERY_PROPS = {
    LEVEL: 'level',
    STATUS: 'status'
};

const CONNECTION_PROPS = {
    STATUS: 'status'
};

const TAMPER_PROPS = {
    STATUS: 'status'
};

const AC_PROPS = {
    STATUS: 'status'
};

class RingDevice extends BaseDevice {
    constructor(ringDevice) {
        super(ringDevice, ringDevice.id);

        this.batteryNode,
        this.connectionNode = null
        this.tamperNode = null
        this.acNode = null;

        this.setBatteryNode();
        this.setConnectionNode();
        this.setTamperNode();

        if (typeof ringDevice.data.acStatus !== undefined) {
            this.setAcNode();
        }
    }

    static isSupported(deviceType) {
        return false;
    }

    setBatteryNode() {
        this.batteryNode = this.homieDevice.node('battery', 'Battery', 'power');

        if (this.ringDevice.data.batteryLevel !== undefined) {
            this
                .batteryNode
                .advertise(BATTERY_PROPS.LEVEL)
                .setName("Battery Level")
                .setRetained(true)
                .setDatatype('integer')
                .setUnit('%');
        }

        this
            .batteryNode
            .advertise(BATTERY_PROPS.STATUS)
            .setName("Battery Status")
            .setRetained(true)
            .setDatatype('string');
    }

    setConnectionNode() {
        this.connectionNode = this.homieDevice.node('connection', 'Connection', 'connection');

        this
            .connectionNode
            .advertise(CONNECTION_PROPS.STATUS)
            .setName("Connection Status")
            .setRetained(true)
            .setDatatype('string');
    }

    setTamperNode() {
        this.tamperNode = this.homieDevice.node('tamper', 'Tamper Sensor', 'tamper');

        this
            .tamperNode
            .advertise(TAMPER_PROPS.STATUS)
            .setName("Tamper Status")
            .setRetained(true)
            .setDatatype('boolean');
    }

    setAcNode() {
        this.acNode = this.homieDevice.node('ac', 'AC', 'power');

        this
            .acNode
            .advertise(AC_PROPS.STATUS)
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
            this.batteryNode.setProperty(BATTERY_PROPS.LEVEL).send(batteryLevel);
        }

        const battStatus = this.ringDevice.data.batteryStatus;
        this.batteryNode.setProperty(BATTERY_PROPS.STATUS).send(battStatus);
    }

    publishConnection() {
        const connStatus = this.ringDevice.data.commStatus;
        this.connectionNode.setProperty(CONNECTION_PROPS.STATUS).send(connStatus);
    }

    publishTamper() {
        const tamperStatus = this.ringDevice.data.tamperStatus === 'tamper' ? 'true' : 'false';
        this.tamperNode.setProperty(TAMPER_PROPS.STATUS).send(tamperStatus);
    }

    publishAc() {
        const acStatus = this.ringDevice.data.acStatus;
        this.acNode.setProperty(AC_PROPS.STATUS).send(acStatus);
    }
}

module.exports = RingDevice;