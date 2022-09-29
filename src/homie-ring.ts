import {Location, RingApi, RingDevice, RingCamera, RingDeviceType} from 'ring-client-api';
import {CameraDevice} from './devices/camera-device';
import {ContactSensor} from './devices/contact-sensor';
import {Hub} from './devices/hub';
import {MotionSensor} from './devices/motion-sensor';
import {SecurityKeypad} from './devices/security-keypad';
import {SecurityPanel} from './devices/security-panel';
import {RangeExtender} from './devices/range-extender';
import {Logger} from './logger';
import {Settings} from './config';
import {BaseDevice} from './devices/base-device';

const supportedDevices = [
    ContactSensor,
    Hub,
    MotionSensor,
    SecurityKeypad,
    SecurityPanel,
    RangeExtender
];

const ignoredDeviceTypes = [
    RingDeviceType.AccessCodeVault,
    RingDeviceType.AccessCode,
    RingDeviceType.ZigbeeAdapter,
    "adapter.zwave"
];

export class HomieRing {
    private devices: Array<BaseDevice<RingDevice | RingCamera>> = [];

    constructor(
        private logger: Logger,
        private settings: Settings,
        private ringApi: RingApi,
    ) {}

    async start() {
        this.logger.info("Starting homie-ring...");

        try {
            await this.setupLocations();
        } catch (err) {
            this.logger.error("Encountered an error while starting: ", err);
        }
    }

    async setupLocations() {
        const locations = await this.ringApi.getLocations();

        const callbacks = locations.map(async location => {
            await this.setupLocation(location);
        });

        await Promise.all(callbacks);
    }

    async setupLocation(location: Location) {
        this.logger.info("Setting up {locationId}", {locationId: location.locationId});

        await this.setupCameras(location);
        await this.setupDevices(location);
    }

    async setupCameras(location: Location) {
        await Promise.all(location.cameras.map(async camera => {
            this.logger.info("Setting up {camera}", {
                id: camera.id,
                name: camera.name,
                type: camera.deviceType
            });

            const cameraDevice = new CameraDevice(
                this.logger,
                this.settings,
                camera,
                location.locationId,
                this.settings.ring.cameraSnapshotPollingSeconds,
            );
            this.devices.push(cameraDevice);
            await cameraDevice.start();
        }));
    }

    async setupDevices(location: Location) {
        const locationDevices = await location.getDevices();

        const setupCallbacks = locationDevices
            .filter(device => ignoredDeviceTypes.indexOf(device.deviceType) === -1)
            .map(async device => {
                await this.setupDevice(device);
            });

        await Promise.all(setupCallbacks);
    }

    async setupDevice(device: RingDevice) {
        const deviceType = supportedDevices.find(
            supportedDevice => supportedDevice.isSupported(device.deviceType)
        );

        if (deviceType) {
            this.logger.info("Setting up {device}", {
                id: device.id,
                name: device.name,
                type: device.deviceType
            });

            const ringDevice = new deviceType(this.logger, this.settings, device);
            this.devices.push(ringDevice);
            await ringDevice.start();
        } else {
            this.logger.debug("Unknown device type {device}", {
                type: device.deviceType,
                data: device.data
            });
        }
    }

    async stop() {
        this.logger.info("Stopping MQTT connections...");

        const callbacks = this.devices.map(async device => {
            await device.stop();
        });

        await Promise.all(callbacks);
    }
}
