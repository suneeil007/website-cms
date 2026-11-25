
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { fileTypeFromFile } from "file-type";

import {
    IMAGE_FORMATS,
    DOCUMENT_FORMATS,
    MEDIA_LIMITS,
} from "./media.constants.js";

const STORAGE_ROOT = path.resolve(
    process.cwd(),
    "storage",
    "uploads"
);

const TEMP_DIR = path.join(STORAGE_ROOT, "temporary");

export async function initializeStorage() {
    await Promise.all([
        fs.mkdir(TEMP_DIR, { recursive: true }),
        fs.mkdir(path.join(STORAGE_ROOT, "images"), { recursive: true }),
        fs.mkdir(path.join(STORAGE_ROOT, "documents"), { recursive: true }),
    ]);
}

export async function validateAndStoreFile(file) {
    const detected = await fileTypeFromFile(file.path);

    if (!detected) {
        throw new Error("Unsupported or invalid file format.");
    }

    const extension = detected.ext.toLowerCase();

    const imageFormat = IMAGE_FORMATS[extension];
    const documentFormat = DOCUMENT_FORMATS[extension];

    const format = imageFormat || documentFormat;

    if (!format || format.mime !== detected.mime) {
        throw new Error("This file format is not allowed.");
    }

    const isImage = Boolean(imageFormat);

    const maxSize = isImage
        ? MEDIA_LIMITS.IMAGE
        : MEDIA_LIMITS.DOCUMENT;

    if (file.size > maxSize) {
        throw new Error(
            `${isImage ? "Image" : "Document"} exceeds the allowed size.`
        );
    }

    const now = new Date();

    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const directory = isImage ? "images" : "documents";

    const folder = path.join(
        STORAGE_ROOT,
        directory,
        year,
        month
    );

    await fs.mkdir(folder, { recursive: true });

    const fileName = `${randomUUID()}.${extension}`;

    const relativePath = path.posix.join(
        directory,
        year,
        month,
        fileName
    );

    const destination = path.join(folder, fileName);

    await fs.rename(file.path, destination);

    return {
        originalName: path.basename(file.originalname).slice(0, 255),
        fileName,
        mimeType: detected.mime,
        extension,
        size: BigInt(file.size),
        storageDisk: "local",
        storagePath: relativePath,
    };
}

export async function deleteStoredFile(storagePath) {
    const absolutePath = resolveStoragePath(storagePath);

    await fs.unlink(absolutePath).catch((error) => {
        if (error.code !== "ENOENT") {
            throw error;
        }
    });
}

export function resolveStoragePath(storagePath) {
    if (
        typeof storagePath !== "string" ||
        path.posix.isAbsolute(storagePath) ||
        path.win32.isAbsolute(storagePath)
    ) {
        throw new Error("Invalid storage path.");
    }

    const normalized = storagePath.replace(/\\/g, "/");

    const absolutePath = path.resolve(
        STORAGE_ROOT,
        ...normalized.split("/")
    );

    if (
        absolutePath === STORAGE_ROOT ||
        !absolutePath.startsWith(STORAGE_ROOT + path.sep)
    ) {
        throw new Error("Invalid storage path.");
    }

    return absolutePath;
}

export async function cleanupTemporaryFile(filePath) {
    if (!filePath) return;

    await fs.unlink(filePath).catch(() => {});
}
