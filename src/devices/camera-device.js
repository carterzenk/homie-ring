const BaseDevice = require('./base-device');

const BATTERY_PROPS = {
    LEVEL: 'level',
    IS_LOW: 'is_low'
};

const LIGHT_PROPS = {
    STATUS: 'status'
};

class CameraDevice extends BaseDevice {
    constructor(ringDevice, locationId) {
        // Use combination of location id and camera id to ensure uniqueness.
        const uniqueId = locationId + '-' + ringDevice.id;
        super(ringDevice, uniqueId);

        this.batteryNode,
        this.lightNode,
        this.sirenNode = null;

        if (ringDevice.hasBattery) {
            this.setBatteryNode();
        }

        if (ringDevice.hasLight) {
            this.setLightNode();
        }

        if (ringDevice.hasSiren) {
            this.setSirenNode();
        }
    }

    setBatteryNode() {
        this.batteryNode = this.homieDevice.node('battery', 'Battery', 'battery');

        this
            .batteryNode
            .advertise(BATTERY_PROPS.LEVEL)
            .setName("Battery Level")
            .setRetained(true)
            .setDatatype('integer')
            .setUnit('%');

        this
            .batteryNode
            .advertise(BATTERY_PROPS.IS_LOW)
            .setName("Battery Level Low")
            .setRetained(true)
            .setDatatype('boolean');
    }

    setLightNode() {
        this.lightNode = this.homieDevice.node('light', 'Light', 'light');

        this
            .lightNode
            .advertise(LIGHT_PROPS.STATUS)
            .setName('Light Status')
            .setRetained(true)
            .setDatatype('boolean')
            .settable((range, value) => {
                this.ringDevice.setLight(value);
            })
    }

    setSirenNode() {
        //TODO: setup the siren node.
    }

    publishData() {
        if (!this.homieDevice.isConnected) {
            return;
        }

        this.publishBatteryLevel();
    }

    publishBatteryLevel() {
        if (!this.batteryNode) {
            return;
        }

        const batteryLevel = `${this.ringDevice.batteryLevel}`;
        this.batteryNode.setProperty(BATTERY_PROPS.LEVEL).send(batteryLevel);

        const battAlert = this.ringDevice.data.alerts.battery;
        const isLow = (battAlert === 'low' || battAlert === 'lowest') ? 'true' : 'false';
        this.batteryNode.setProperty(BATTERY_PROPS.IS_LOW).send(isLow);
    }

    publishLightStatus() {
        if (!this.lightNode) {
            return;
        }

        const lightStatus = this.ringDevice.data.led_status;
        this.lightNode.setProperty(LIGHT_PROPS.STATUS).send(lightStatus);
    }
}

module.exports = CameraDevice;