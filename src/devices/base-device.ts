import HomieDevice from 'homie-device';
import {BehaviorSubject} from 'rxjs';
import {Logger} from 'src/logger';
import {RingDevice} from 'ring-client-api';
import {Settings} from 'src/config';

export type BaseRingDevice = {
    id: number | string;
    name: string;
    onData: BehaviorSubject<Object>
};

export class BaseDevice<DeviceT extends BaseRingDevice = RingDevice> {
    protected homieDevice: HomieDevice;

    constructor(
        protected logger: Logger,
        settings: Settings,
        protected ringDevice: DeviceT,
        uniqueId: string,
    ) {
        this.logger = logger;
        this.publishData = this.publishData.bind(this);
        this.ringDevice = ringDevice;

        this.homieDevice = new HomieDevice({
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

    publishData() {}

    async start(): Promise<void> {
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

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            this.logger.debug('Disconnecting from MQTT broker for {deviceId}...', {
                deviceId: this.ringDevice.id
            });
        
            this.homieDevice.once('disconnect', resolve);
            this.homieDevice.end();
        });
    }
}