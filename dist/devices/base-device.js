"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDevice = void 0;
const homie_device_1 = __importDefault(require("homie-device"));
class BaseDevice {
    logger;
    ringDevice;
    homieDevice;
    constructor(logger, settings, ringDevice, uniqueId) {
        this.logger = logger;
        this.ringDevice = ringDevice;
        this.logger = logger;
        this.publishData = this.publishData.bind(this);
        this.ringDevice = ringDevice;
        this.homieDevice = new homie_device_1.default({
            device_id: uniqueId,
            name: ringDevice.name,
            mqtt: settings.mqtt,
        });
        this.homieDevice.on('connect', () => {
            this.publishData();
            this.ringDevice.onData.subscribe((data) => {
                this.logger.debug("Received data update from {deviceId}", {
                    deviceId: this.ringDevice.id,
                    deviceName: this.ringDevice.name,
                    data: data
                });
                this.publishData();
            });
        });
    }
    publishData() { }
    async start() {
        return new Promise((resolve) => {
            this.logger.debug('Connecting to MQTT broker for {deviceId}...', {
                deviceId: this.ringDevice.id
            });
            this.homieDevice.once('connect', resolve);
            this.homieDevice.setup(true);
            this.homieDevice.mqttClient.on('error', (err) => {
                this.logger.error("Encountered MQTT error.", { error: err });
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.logger.debug('Disconnecting from MQTT broker for {deviceId}...', {
                deviceId: this.ringDevice.id
            });
            this.homieDevice.once('disconnect', resolve);
            this.homieDevice.end();
        });
    }
}
exports.BaseDevice = BaseDevice;
//# sourceMappingURL=base-device.js.map