const HomieRing = require('./src/homie-ring');
const ringApi = require('./src/ring-api');

const homieRing = new HomieRing(ringApi);

homieRing.start();

const onExit = () => {
    homieRing.stop().then(() => {
        process.exit();
    });
}

process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);