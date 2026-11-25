
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fsPromises from "node:fs/promises";

import { MEDIA_LIMITS } from "./media.constants.js";
import { initializeStorage } from "./media.storage.js";

const TEMP_DIR = path.resolve(
    process.cwd(),
    "storage",
    "uploads",
    "temporary"
);

// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, TEMP_DIR);
    },

    filename(req, file, callback) {
        callback(
            null,
            `${randomUUID()}.tmp`
        );
    },
});

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
    storage,

    limits: {
        fileSize: MEDIA_LIMITS.DOCUMENT,
        files: MEDIA_LIMITS.MAX_FILES,
        fields: 10,
        parts: 20,
        fieldSize: 1024 * 1024,
    },
});

// ==========================================
// PREPARE STORAGE
// ==========================================

export async function prepareMediaStorage() {
    await fsPromises.mkdir(
        TEMP_DIR,
        { recursive: true }
    );

    await initializeStorage();
}

// ==========================================
// UPLOAD MIDDLEWARE
// ==========================================

export function uploadMedia(req, res, next) {
    upload.array(
        "files",
        MEDIA_LIMITS.MAX_FILES
    )(
        req,
        res,
        async (error) => {
            if (!error) {
                return next();
            }

            await Promise.allSettled(
                (req.files || []).map((file) =>
                    fsPromises.unlink(file.path)
                )
            );

            if (error instanceof multer.MulterError) {
                error.statusCode = 400;

                if (error.code === "LIMIT_FILE_SIZE") {
                    error.message =
                        "File exceeds the maximum allowed upload size.";
                }

                if (error.code === "LIMIT_FILE_COUNT") {
                    error.message =
                        `Maximum ${MEDIA_LIMITS.MAX_FILES} files allowed per upload.`;
                }
            }

            next(error);
        }
    );
}
