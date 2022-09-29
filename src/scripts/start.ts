import {HomieRing} from '../homie-ring';
import {RingApi} from 'ring-client-api';
import {createLogger} from '../logger';
import {getSettings, updateRefreshToken} from '../config';

async function main() {
    const settings = await getSettings();
    
    const logger = createLogger(settings.logger);

    const {__cameraSnapshotPollingSeconds, ...ringSettings} = settings.ring;
    const ringApi = new RingApi(ringSettings);

    ringApi.onRefreshTokenUpdated.subscribe(async ({newRefreshToken, oldRefreshToken}) => {
        logger.info('Refresh token updated');
    
        if (!oldRefreshToken) {
            return
        }
    
        logger.info('Writing new refresh token to config');
        await updateRefreshToken(newRefreshToken);
    });

    const homieRing = new HomieRing(logger, settings, ringApi);

    const onExit = () => homieRing.stop().then(process.exit());
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);

    await homieRing.start();
}

main();
