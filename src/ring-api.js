const config = require('./config');
const { RingApi } = require('ring-client-api');

const { cameraSnapshotPollingSeconds, ...settings } = config.get().ring;
const ringApi = new RingApi(settings);

module.exports = ringApi;