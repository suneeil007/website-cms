
import app from "./app.js";

import { env } from "./config/env.js";

import prisma from "./core/database/prisma.js";

import {
    prepareMediaStorage,
} from "./modules/Media/media.upload.js";

await prepareMediaStorage();

const server = app.listen(env.PORT, () => {
    console.log(
        `${env.APP_NAME} running at http://localhost:${env.PORT}`
    );

    console.log(
        `Health check: http://localhost:${env.PORT}/api/v1/health`
    );
});

let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`${signal} received. Shutting down...`);

    const forceShutdown = setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, 10000);

    forceShutdown.unref();

    server.close(async () => {
        try {
            await prisma.$disconnect();

            clearTimeout(forceShutdown);

            process.exit(0);
        } catch (error) {
            console.error("Shutdown failed:", error);
            process.exit(1);
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));
