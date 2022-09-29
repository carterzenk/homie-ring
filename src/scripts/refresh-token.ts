import {acquireRefreshToken} from 'ring-client-api/lib/api/refresh-token';
import {updateRefreshToken} from '../config';

async function main() {
    const refreshToken = await acquireRefreshToken();
    await updateRefreshToken(refreshToken);
    console.log("Config file updated with refresh token.");
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
process.on('unhandledRejection', () => {})

main();
