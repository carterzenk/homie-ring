"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomieRing = void 0;
const ring_client_api_1 = require("ring-client-api");
const camera_device_1 = require("./devices/camera-device");
const contact_sensor_1 = require("./devices/contact-sensor");
const hub_1 = require("./devices/hub");
const motion_sensor_1 = require("./devices/motion-sensor");
const security_keypad_1 = require("./devices/security-keypad");
const security_panel_1 = require("./devices/security-panel");
const range_extender_1 = require("./devices/range-extender");
const supportedDevices = [
    contact_sensor_1.ContactSensor,
    hub_1.Hub,
    motion_sensor_1.MotionSensor,
    security_keypad_1.SecurityKeypad,
    security_panel_1.SecurityPanel,
    range_extender_1.RangeExtender
];
const ignoredDeviceTypes = [
    ring_client_api_1.RingDeviceType.AccessCodeVault,
    ring_client_api_1.RingDeviceType.AccessCode,
    ring_client_api_1.RingDeviceType.ZigbeeAdapter,
    "adapter.zwave"
];
class HomieRing {
    logger;
    settings;
    ringApi;
    devices = [];
    constructor(logger, settings, ringApi) {
        this.logger = logger;
        this.settings = settings;
        this.ringApi = ringApi;
    }
    async start() {
        this.logger.info("Starting homie-ring...");
        try {
            await this.setupLocations();
        }
        catch (err) {
            this.logger.error("Encountered an error while starting: ", err);
        }
    }
    async setupLocations() {
        const locations = await this.ringApi.getLocations();
        const callbacks = locations.map(async (location) => {
            await this.setupLocation(location);
        });
        await Promise.all(callbacks);
    }
    async setupLocation(location) {
        this.logger.info("Setting up {locationId}", { locationId: location.locationId });
        await this.setupCameras(location);
        await this.setupDevices(location);
    }
    async setupCameras(location) {
        await Promise.all(location.cameras.map(async (camera) => {
            this.logger.info("Setting up {camera}", {
                id: camera.id,
                name: camera.name,
                type: camera.deviceType
            });
            const cameraDevice = new camera_device_1.CameraDevice(this.logger, this.settings, camera, location.locationId, this.settings.ring.cameraSnapshotPollingSeconds);
            this.devices.push(cameraDevice);
            await cameraDevice.start();
        }));
    }
    async setupDevices(location) {
        const locationDevices = await location.getDevices();
        const setupCallbacks = locationDevices
            .filter(device => ignoredDeviceTypes.indexOf(device.deviceType) === -1)
            .map(async (device) => {
            await this.setupDevice(device);
        });
        await Promise.all(setupCallbacks);
    }
    async setupDevice(device) {
        const deviceType = supportedDevices.find(supportedDevice => supportedDevice.isSupported(device.deviceType));
        if (deviceType) {
            this.logger.info("Setting up {device}", {
                id: device.id,
                name: device.name,
                type: device.deviceType
            });
            const ringDevice = new deviceType(this.logger, this.settings, device);
            this.devices.push(ringDevice);
            await ringDevice.start();
        }
        else {
            this.logger.debug("Unknown device type {device}", {
                type: device.deviceType,
                data: device.data
            });
        }
    }
    async stop() {
        this.logger.info("Stopping MQTT connections...");
        const callbacks = this.devices.map(async (device) => {
            await device.stop();
        });
        await Promise.all(callbacks);
    }
}
exports.HomieRing = HomieRing;
//# sourceMappingURL=homie-ring.js.map