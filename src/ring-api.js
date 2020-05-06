const config = require('./config');
const logger = require('./logger');
const { RingApi } = require('ring-client-api');

const { cameraSnapshotPollingSeconds, ...settings } = config.get().ring;
const ringApi = new RingApi(settings);

ringApi.onRefreshTokenUpdated.subscribe(({ newRefreshToken, oldRefreshToken }) => {
    logger.info('Refresh token updated');

    if (!oldRefreshToken) {
        return
    }

    logger.info('Writing new refresh token to config');
    config.updateRefreshToken(newRefreshToken);
});

module.exports = ringApi;