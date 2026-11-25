
import fs from "node:fs/promises";

import * as repository from "./media.repository.js";

import {
    validateAndStoreFile,
    deleteStoredFile,
    resolveStoragePath,
    cleanupTemporaryFile,
} from "./media.storage.js";

import {
    updateMediaSchema,
    listMediaSchema,
    mediaUuidSchema,
    attachMediaSchema,
} from "./media.validation.js";

// ==========================================
// ERROR HELPER
// ==========================================

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
}

// ==========================================
// UUID VALIDATION
// ==========================================

function validateUuid(uuid) {
    return mediaUuidSchema.parse({ uuid }).uuid;
}

// ==========================================
// MEDIA RESOURCE
// ==========================================

function serializeMedia(media) {
    return {
        ...media,

        size: Number(media.size),

        url: `/api/v1/media/${media.uuid}/download`,

        usageCount:
            media._count?.pages ??
            media.pages?.length ??
            0,
    };
}

// ==========================================
// UPLOAD MEDIA
// ==========================================

export async function upload(files = []) {
    if (!files.length) {
        throw createError(
            "Please select at least one file.",
            422
        );
    }

    const storedFiles = [];

    let databaseCommitted = false;

    try {
        // Validate and store uploaded files.
        for (const file of files) {
            const stored = await validateAndStoreFile(file);

            storedFiles.push(stored);
        }

        // Create database records.
        const records = await repository.createMany(storedFiles);

        databaseCommitted = true;

        return records.map(serializeMedia);

    } catch (error) {

        // Remove stored files if database creation failed.
        if (!databaseCommitted) {
            await Promise.allSettled(
                storedFiles.map((file) =>
                    deleteStoredFile(file.storagePath)
                )
            );
        }

        throw error;

    } finally {

        // Always remove temporary uploads.
        await Promise.allSettled(
            files.map((file) =>
                cleanupTemporaryFile(file.path)
            )
        );
    }
}

// ==========================================
// GET ALL MEDIA
// ==========================================

export async function getAll(query = {}) {
    const filters = listMediaSchema.parse(query);

    const result = await repository.findAll({
        page: filters.page,
        perPage: filters.per_page,
        type: filters.type,
        search: filters.search,
        sortOrder: filters.sortOrder,
    });

    return {
        items: result.items.map(serializeMedia),

        pagination: {
            page: filters.page,

            per_page: filters.per_page,

            total: result.total,

            last_page: Math.max(
                1,
                Math.ceil(
                    result.total / filters.per_page
                )
            ),
        },
    };
}

// ==========================================
// GET MEDIA DETAILS
// ==========================================

export async function getByUuid(uuid) {
    validateUuid(uuid);

    const media = await repository.findByUuid(uuid);

    if (!media) {
        throw createError(
            "Media not found.",
            404
        );
    }

    return serializeMedia(media);
}

// ==========================================
// UPDATE MEDIA
// ==========================================

export async function update(uuid, payload) {
    validateUuid(uuid);

    const data = updateMediaSchema.parse(payload);

    const existing = await repository.findByUuid(uuid);

    if (!existing) {
        throw createError(
            "Media not found.",
            404
        );
    }

    const updated = await repository.update(
        uuid,
        data
    );

    return serializeMedia(updated);
}

// ==========================================
// DELETE MEDIA
// ==========================================

export async function remove(uuid) {
    validateUuid(uuid);

    const result = await repository.deleteRecord(uuid);

    if (!result) {
        throw createError(
            "Media not found.",
            404
        );
    }

    if (!result.deleted) {
        throw createError(
            "This media file is attached to pages. Detach it before deleting.",
            409
        );
    }

    // Database record is already deleted.
    // Filesystem cleanup can be retried if it fails.
    await deleteStoredFile(result.storagePath);

    return true;
}

// ==========================================
// ATTACH MEDIA TO PAGE
// ==========================================

export async function attach(uuid, payload) {
    validateUuid(uuid);

    const data = attachMediaSchema.parse(payload);

    const media = await repository.findByUuid(uuid);

    if (!media) {
        throw createError(
            "Media not found.",
            404
        );
    }

    const page = await repository.findPageByUuid(
        data.pageUuid
    );

    if (!page) {
        throw createError(
            "Page not found.",
            404
        );
    }

    const attachment = await repository.attachToPage({
        mediaId: media.id,
        pageId: page.id,
        role: data.role ?? null,
        sortOrder: data.sortOrder,
    });

    return attachment;
}

// ==========================================
// GET DOWNLOAD INFORMATION
// ==========================================

export async function getDownload(uuid) {
    validateUuid(uuid);

    const media = await repository.findByUuid(uuid);

    if (!media) {
        throw createError(
            "Media not found.",
            404
        );
    }

    const absolutePath = resolveStoragePath(
        media.storagePath
    );

    try {
        await fs.access(absolutePath);
    } catch {
        throw createError(
            "Stored file is missing.",
            404
        );
    }

    return {
        absolutePath,

        mimeType: media.mimeType,

        originalName: media.originalName,

        isImage: media.mimeType.startsWith("image/"),
    };
}


export async function detach(uuid, payload) {
    validateUuid(uuid);

    const data = attachMediaSchema.pick({
        pageUuid: true,
    }).parse(payload);

    const media = await repository.findByUuid(uuid);

    if (!media) {
        throw createError("Media not found.", 404);
    }

    const page = await repository.findPageByUuid(data.pageUuid);

    if (!page) {
        throw createError("Page not found.", 404);
    }

    await repository.detachFromPage({
        mediaId: media.id,
        pageId: page.id,
    });

    return true;
}
