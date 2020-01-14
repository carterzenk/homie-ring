const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const merge = require('lodash.merge');

const filename = 'homie-ring.yaml';

const defaults = {
    homie: {
        device_name: "Ring",
        device_id: "ring"
    },
    mqtt: {
        host: 'localhost',
        port: 1883,
        base_topic: 'devices/',
        auth: false
    },
    ring: {},
    logger: {
        level: 'info'
    }
};

let settings;

function getSettings() {
    if (!settings) {
        settings = merge({}, defaults, load());
    }

    return settings;
}

function load() {
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found at path: ${configPath}`);
    }

    const configFile = fs.readFileSync(configPath, 'utf8');

    return yaml.safeLoad(configFile);
}

function getConfigPath() {
    let configPath = null;
    
    if (process.env.HOMIE_RING_CONFIG) {
        configPath = process.env.HOMIE_RING_CONFIG;
    } else {
        configPath = path.join(__dirname, '..', 'config');
        configPath = path.normalize(configPath);
    }

    return path.join(configPath, filename);
}

module.exports = {
    get: getSettings
};