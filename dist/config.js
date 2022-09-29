"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefreshToken = exports.getSettings = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const filename = 'homie-ring.yaml';
const defaults = {
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
async function getSettings() {
    if (!settings) {
        settings = (0, lodash_merge_1.default)({}, defaults, await load());
    }
    return settings;
}
exports.getSettings = getSettings;
async function load() {
    const configPath = getConfigPath();
    const configFile = await fs_1.default.promises.readFile(configPath, { encoding: 'utf8' });
    return js_yaml_1.default.safeLoad(configFile);
}
async function write(content) {
    const configPath = getConfigPath();
    await fs_1.default.promises.writeFile(configPath, js_yaml_1.default.safeDump(content));
}
function getConfigPath() {
    let configPath = null;
    if (process.env.HOMIE_RING_CONFIG) {
        configPath = process.env.HOMIE_RING_CONFIG;
    }
    else {
        configPath = path_1.default.join(__dirname, '..', 'config');
        configPath = path_1.default.normalize(configPath);
    }
    console.log('using config path:', configPath);
    return path_1.default.join(configPath, filename);
}
async function updateRefreshToken(newToken) {
    const config = await load();
    config.ring.refreshToken = newToken;
    await write(config);
}
exports.updateRefreshToken = updateRefreshToken;
//# sourceMappingURL=config.js.map