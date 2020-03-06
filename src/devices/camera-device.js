const BaseDevice = require('./base-device');
const logger = require('../logger');

const CAMERA_PROPS = {
    SNAPSHOT_DATA: 'snapshot_data',
    SNAPSHOT_LAST_UPDATED: 'snapshot_last_updated'
};

const BATTERY_PROPS = {
    LEVEL: 'level',
    IS_LOW: 'is_low'
};

const LIGHT_PROPS = {
    STATUS: 'status'
};

class CameraDevice extends BaseDevice {
    constructor(ringDevice, locationId, snapshotPollingSeconds) {
        // Use combination of location id and camera id to ensure uniqueness.
        const uniqueId = locationId + '-' + ringDevice.id;
        super(ringDevice, uniqueId);

        this.batteryNode,
        this.lightNode,
        this.cameraNode,
        this.snapshotPublishInterval = null;

        this.publishSnapshot = this.publishSnapshot.bind(this);

        this.setCameraNode();

        if (ringDevice.hasBattery) {
            this.setBatteryNode();
        }

        if (ringDevice.hasLight) {
            this.setLightNode();
        }

        if (snapshotPollingSeconds) {
            this.homieDevice.on('connect', () => {
                this.snapshotPublishInterval = setInterval(this.publishSnapshot, snapshotPollingSeconds * 1000);
            });

            this.homieDevice.on('disconnect', () => {
                if (this.snapshotPublishInterval) {
                    clearInterval(this.snapshotPublishInterval);
                }
            });
        }
    }

    setCameraNode() {
        this.cameraNode = this.homieDevice.node('camera', 'Camera', 'camera');

        this
            .cameraNode
            .advertise(CAMERA_PROPS.SNAPSHOT_DATA)
            .setName("Snapshot Data")
            .setRetained(true)
            .setDatatype('string');

        this
            .cameraNode
            .advertise(CAMERA_PROPS.SNAPSHOT_LAST_UPDATED)
            .setName("Snapshot Last Updated")
            .setRetained(true)
            .setDatatype('integer');
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

    publishData() {
        if (!this.homieDevice.isConnected) {
            return;
        }

        if (this.batteryNode) {
            this.publishBatteryLevel();
        }

        if (this.lightNode) {
            this.publishLightStatus();
        }
    }

    publishBatteryLevel() {
        const batteryLevel = `${this.ringDevice.batteryLevel}`;
        this.batteryNode.setProperty(BATTERY_PROPS.LEVEL).send(batteryLevel);

        const battAlert = this.ringDevice.data.alerts.battery;
        const isLow = (battAlert === 'low' || battAlert === 'lowest') ? 'true' : 'false';
        this.batteryNode.setProperty(BATTERY_PROPS.IS_LOW).send(isLow);
    }

    publishLightStatus() {
        const lightStatus = this.ringDevice.data.led_status;
        this.lightNode.setProperty(LIGHT_PROPS.STATUS).send(lightStatus);
    }

    async publishSnapshot() {
        try {
            logger.info('Refreshing snapshot on camera {id}.', { id: this.ringDevice.id });
            const snapshotData = await this.ringDevice.getSnapshot();

            const responseTimestamp = `${snapshotData.responseTimestamp}`;
            this.cameraNode.setProperty(CAMERA_PROPS.SNAPSHOT_LAST_UPDATED).send(responseTimestamp);

            const base64Snapshot = snapshotData.toString('base64');
            this.cameraNode.setProperty(CAMERA_PROPS.SNAPSHOT_DATA).send(base64Snapshot);
        } catch (err) {
            logger.error("Encountered an {error} while refreshing snapshot.", { error: err.message });
        }
    }
}

module.exports = CameraDevice;