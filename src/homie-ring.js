const logger = require('./logger');

const { RingDeviceType } = require('ring-client-api');

const CameraDevice = require('./devices/camera-device');
const ContactSensor = require('./devices/contact-sensor');
const Hub = require('./devices/hub');
const MotionSensor = require('./devices/motion-sensor');
const SecurityKeypad = require('./devices/security-keypad');
const SecurityPanel = require('./devices/security-panel');
const RangeExtender = require('./devices/range-extender');

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

class HomieRing {
    constructor(ringApi) {
        this.ringApi = ringApi;
        this.devices = [];
    }

    async start() {
        logger.info("Starting homie-ring...");

        try {
            await this.setupLocations();
        } catch (err) {
            logger.error("Encountered an error while starting: ", err);
        }
    }

    async setupLocations() {
        const locations = await this.ringApi.getLocations();

        const callbacks = locations.map(async location => {
            await this.setupLocation(location);
        });

        await Promise.all(callbacks);
    }

    async setupLocation(location) {
        logger.info("Setting up {locationId}", {locationId: location.locationId});

        await this.setupCameras(location);
        await this.setupDevices(location);
    }

    async setupCameras(location) {
        await Promise.all(location.cameras.map(async camera => {
            const cameraDevice = new CameraDevice(camera, location.locationId);
            this.devices.push(cameraDevice);
            await cameraDevice.start();
        }));
    }

    async setupDevices(location) {
        const locationDevices = await location.getDevices();

        const setupCallbacks = locationDevices
            .filter(device => ignoredDeviceTypes.indexOf(device.deviceType) === -1)
            .map(async device => {
                await this.setupDevice(device);
            });
        await Promise.all(setupCallbacks);
    }

    async setupDevice(device) {
        const deviceType = supportedDevices.find(
            supportedDevice => supportedDevice.isSupported(device.deviceType)
        );

        if (deviceType) {
            logger.info("Setting up {device}", {
                id: device.id,
                name: device.name,
                type: device.deviceType
            });

            const ringDevice = new deviceType(device);
            this.devices.push(ringDevice);
            await ringDevice.start();
        } else {
            logger.debug("Unknown device type {device}", {
                type: device.deviceType,
                data: device.data
            });
        }
    }

    async stop() {
        logger.info("Stopping MQTT connections...");

        const callbacks = this.devices.map(async device => {
            await device.stop();
        });

        await Promise.all(callbacks);
    }
}

module.exports = HomieRing;