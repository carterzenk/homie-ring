"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refresh_token_1 = require("ring-client-api/lib/api/refresh-token");
const config_1 = require("../config");
async function main() {
    const refreshToken = await (0, refresh_token_1.acquireRefreshToken)();
    await (0, config_1.updateRefreshToken)(refreshToken);
    console.log("Config file updated with refresh token.");
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
process.on('unhandledRejection', () => { });
main();
//# sourceMappingURL=refresh-token.js.map