import HomieNode from 'homie-device/lib/HomieNode';
import {BaseDevice} from './base-device';
import {Logger} from 'src/logger';
import {RingCamera} from 'ring-client-api';
import {Settings} from 'src/config';

enum CameraProps {
    SNAPSHOT_DATA = 'snapshot_data',
    SNAPSHOT_LAST_UPDATED = 'snapshot_last_updated',
};

enum BatteryProps {
    LEVEL = 'level',
    IS_LOW = 'is_low',
}

enum LightProps {
    STATUS = 'status',
};

export class CameraDevice extends BaseDevice<RingCamera> {
    private batteryNode: HomieNode;
    private lightNode: HomieNode;
    private cameraNode: HomieNode;
    private snapshotPublishInterval: NodeJS.Timer;

    constructor(
        logger: Logger,
        settings: Settings,
        ringDevice: RingCamera,
        locationId: string,
        snapshotPollingSeconds?: number,
    ) {
        // Use combination of location id and camera id to ensure uniqueness.
        const uniqueId = locationId + '-' + ringDevice.id;
        super(logger, settings, ringDevice, uniqueId);

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
            .advertise(CameraProps.SNAPSHOT_DATA)
            .setName("Snapshot Data")
            .setRetained(true)
            .setDatatype('string');

        this
            .cameraNode
            .advertise(CameraProps.SNAPSHOT_LAST_UPDATED)
            .setName("Snapshot Last Updated")
            .setRetained(true)
            .setDatatype('integer');
    }

    setBatteryNode() {
        this.batteryNode = this.homieDevice.node('battery', 'Battery', 'battery');

        this
            .batteryNode
            .advertise(BatteryProps.LEVEL)
            .setName("Battery Level")
            .setRetained(true)
            .setDatatype('integer')
            .setUnit('%');

        this
            .batteryNode
            .advertise(BatteryProps.IS_LOW)
            .setName("Battery Level Low")
            .setRetained(true)
            .setDatatype('boolean');
    }

    setLightNode() {
        this.lightNode = this.homieDevice.node('light', 'Light', 'light');

        this
            .lightNode
            .advertise(LightProps.STATUS)
            .setName('Light Status')
            .setRetained(true)
            .setDatatype('boolean')
            .settable((__range, value) => {
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
        this.batteryNode.setProperty(BatteryProps.LEVEL).send(batteryLevel);

        const battAlert = this.ringDevice.data.alerts.battery;
        const isLow = (battAlert === 'low' || battAlert === 'lowest') ? 'true' : 'false';
        this.batteryNode.setProperty(BatteryProps.IS_LOW).send(isLow);
    }

    publishLightStatus() {
        const lightStatus = this.ringDevice.data.led_status;
        this.lightNode.setProperty(LightProps.STATUS).send(lightStatus);
    }

    async publishSnapshot() {
        try {
            this.logger.info('Refreshing snapshot on camera {id}.', { id: this.ringDevice.id });
            const snapshotData = await this.ringDevice.getNextSnapshot({});

            const responseTimestamp = `${snapshotData.responseTimestamp}`;
            this.cameraNode.setProperty(CameraProps.SNAPSHOT_LAST_UPDATED).send(responseTimestamp);

            const base64Snapshot = snapshotData.toString('base64');
            this.cameraNode.setProperty(CameraProps.SNAPSHOT_DATA).send(base64Snapshot);
        } catch (err) {
            this.logger.error("Encountered an {error} while refreshing snapshot.", { error: err.message });
        }
    }
}