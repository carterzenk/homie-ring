import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import merge from 'lodash.merge';
import {RingApiOptions} from 'ring-client-api';
import {DeepPartial} from 'ring-client-api/lib/api/util';

const filename = 'homie-ring.yaml';

export type Settings = {
    mqtt: {
        host: string;
        port: number;
        base_topic: string;
        auth: boolean;
    },
    ring: RingApiOptions & {cameraSnapshotPollingSeconds: number},
    logger: {
        level: 'debug' | 'info' | 'notice' | 'warn' | 'error',
    },
};

const defaults: DeepPartial<Settings> = {
    mqtt: {
        host: 'localhost',
        port: 1883,
        base_topic: 'devices/ring/',
        auth: false
    },
    ring: {},
    logger: {
        level: 'info'
    }
};

let settings;

export async function getSettings() {
    if (!settings) {
        settings = merge({}, defaults, await load());
    }

    return settings;
}

async function load() {
    const configPath = getConfigPath();
    const configFile = await fs.promises.readFile(configPath, {encoding: 'utf8'});
    return yaml.safeLoad(configFile);
}

async function write(content) {
    const configPath = getConfigPath();
    await fs.promises.writeFile(configPath, yaml.safeDump(content));
}

function getConfigPath() {
    let configPath = null;
    
    if (process.env.HOMIE_RING_CONFIG) {
        configPath = process.env.HOMIE_RING_CONFIG;
    } else {
        configPath = path.join(__dirname, '..', 'config');
        configPath = path.normalize(configPath);
    }

    console.log('using config path:', configPath);

    return path.join(configPath, filename);
}

export async function updateRefreshToken(newToken) {
    const config = await load();

    config.ring.refreshToken = newToken;

    await write(config);
}
