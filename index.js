const ringApi = require('./src/ring-api');
const logger = require('./src/logger');

const findLocations = async () => {
    logger.info("Finding locations...");
    const locations = await ringApi.getLocations();
    logger.info("Found {count} locations", { count: locations.length });

    if (locations.length === 1) {
        const location = locations[0]

        logger.info("Finding devices...");
        const devices = await location.getDevices();
        logger.info("Found {count} devices", { count: devices.length });

        devices.forEach((device) => {
            logger.info("Found {device}", device.data);
        });

        logger.info("Found {count} cameras", { count: location.cameras.length });

        location.cameras.forEach((camera) => {
            logger.info("Found {camera}", camera.data);
        });
    } else {
        logger.warn("Unexpected number of locations.");
    }
}

findLocations();