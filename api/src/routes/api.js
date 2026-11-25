
import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import prisma from "../core/database/prisma.js";

const router = Router();

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const modulesDirectory = path.resolve(currentDirectory, "../modules");

function toKebabCase(value) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
}

// Health check: GET /api/v1/health
router.get("/health", async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            message: "API is healthy.",
            data: {
                application: "Website CMS API",
                database: "connected",
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Automatically discover and register module routes.
if (fs.existsSync(modulesDirectory)) {
    const modules = fs.readdirSync(modulesDirectory, {
        withFileTypes: true,
    });

    for (const entry of modules) {
        if (!entry.isDirectory()) continue;

        const moduleDirectory = path.join(
            modulesDirectory,
            entry.name
        );

        const routeFile = path.join(
            moduleDirectory,
            `${entry.name.charAt(0).toLowerCase()}${entry.name.slice(1)}.routes.js`
        );

        if (!fs.existsSync(routeFile)) continue;

        const moduleRoutes = await import(
            pathToFileURL(routeFile).href
        );

        if (!moduleRoutes.default) {
            throw new Error(
                `Module ${entry.name} must export a default Express router.`
            );
        }

        const prefix = toKebabCase(entry.name);

        router.use(`/${prefix}`, moduleRoutes.default);

        console.log(
            `Registered module route: /api/v1/${prefix}`
        );
    }
}

export default router;
