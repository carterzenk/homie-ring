"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homie_ring_1 = require("../homie-ring");
const ring_client_api_1 = require("ring-client-api");
const logger_1 = require("../logger");
const config_1 = require("../config");
async function main() {
    const settings = await (0, config_1.getSettings)();
    const logger = (0, logger_1.createLogger)(settings.logger);
    const { __cameraSnapshotPollingSeconds, ...ringSettings } = settings.ring;
    const ringApi = new ring_client_api_1.RingApi(ringSettings);
    ringApi.onRefreshTokenUpdated.subscribe(async ({ newRefreshToken, oldRefreshToken }) => {
        logger.info('Refresh token updated');
        if (!oldRefreshToken) {
            return;
        }
        logger.info('Writing new refresh token to config');
        await (0, config_1.updateRefreshToken)(newRefreshToken);
    });
    const homieRing = new homie_ring_1.HomieRing(logger, settings, ringApi);
    const onExit = () => homieRing.stop().then(process.exit());
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);
    await homieRing.start();
}
main();
//# sourceMappingURL=start.js.map