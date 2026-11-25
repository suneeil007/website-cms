
import * as repository from "./page.repository.js";

import {
    createPageSchema,
    updatePageSchema,
    pageUuidSchema,
    listPagesSchema,
} from "./page.validation.js";

/**
 * Create application error.
 */
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
}

/**
 * Convert title into URL-friendly slug.
 */
function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 220)
        .replace(/-+$/g, "") || "page";
}

/**
 * Generate unique slug.
 */
async function generateUniqueSlug(title) {
    const baseSlug = slugify(title);

    let slug = baseSlug;
    let counter = 1;

    while (await repository.findBySlug(slug)) {
        counter++;

        const suffix = `-${counter}`;

        slug = `${baseSlug.slice(
            0,
            220 - suffix.length
        )}${suffix}`;
    }

    return slug;
}

/**
 * Validate page UUID.
 */
function validateUuid(uuid) {
    return pageUuidSchema.parse({
        uuid,
    }).uuid;
}

/**
 * Convert Prisma database errors into API errors.
 */
function handleDatabaseError(error) {
    if (error.code === "P2002") {
        throw createError(
            "A page with this slug already exists.",
            409
        );
    }

    if (error.code === "P2025") {
        throw createError(
            "Page not found.",
            404
        );
    }

    throw error;
}

/**
 * Format attached media for API responses.
 */
function serializeMedia(attachments = []) {
    return attachments.map((attachment) => {
        const media = attachment.media;

        return {
            uuid: media.uuid,
            originalName: media.originalName,
            fileName: media.fileName,
            mimeType: media.mimeType,
            extension: media.extension,
            size: Number(media.size),

            url: `/api/v1/media/${media.uuid}/download`,

            altText: media.altText,
            caption: media.caption,

            role: attachment.role,
            sortOrder: attachment.sortOrder,
        };
    });
}

/**
 * Format Page response.
 */
function serializePage(page) {
    if (!page) {
        return null;
    }

    const {
        media,
        ...pageData
    } = page;

    return {
        ...pageData,
        media: serializeMedia(media),
    };
}

/**
 * Get all pages.
 */
export async function getAll(query = {}) {
    const filters = listPagesSchema.parse(query);

    const result = await repository.findAll({
        page: filters.page,
        perPage: filters.per_page,
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
    });

    return {
        items: result.items.map(serializePage),

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

/**
 * Get page by UUID.
 */
export async function getByUuid(uuid) {
    validateUuid(uuid);

    const record = await repository.findByUuid(uuid);

    if (!record) {
        throw createError(
            "Page not found.",
            404
        );
    }

    return serializePage(record);
}

/**
 * Create page.
 */
export async function create(payload) {
    const data = createPageSchema.parse(payload);

    try {
        // Separate media from Page fields.
        const {
            media = [],
            ...pageData
        } = data;

        const slug = pageData.slug
            ? pageData.slug
            : await generateUniqueSlug(pageData.title);

        if (await repository.findBySlug(slug)) {
            throw createError(
                "A page with this slug already exists.",
                409
            );
        }

        pageData.slug = slug;

        pageData.publishedAt =
            pageData.status === "PUBLISHED"
                ? new Date()
                : null;

        const record = await repository.create(
            pageData,
            media
        );

        return serializePage(record);
    } catch (error) {
        handleDatabaseError(error);
    }
}

/**
 * Update page.
 */
export async function update(uuid, payload) {
    validateUuid(uuid);

    const data = updatePageSchema.parse(payload);

    try {
        const existing = await repository.findByUuid(uuid);

        if (!existing) {
            throw createError(
                "Page not found.",
                404
            );
        }

        // Preserve undefined to distinguish an omitted
        // media field from an explicitly empty array.
        const {
            media,
            ...pageData
        } = data;

        // Check slug uniqueness when changing the slug.
        if (pageData.slug) {
            const duplicate = await repository.findBySlug(
                pageData.slug,
                uuid
            );

            if (duplicate) {
                throw createError(
                    "A page with this slug already exists.",
                    409
                );
            }
        }

        // Manage publishing timestamps.
        if (pageData.status === "PUBLISHED") {
            pageData.publishedAt =
                existing.publishedAt || new Date();
        } else if (pageData.status === "DRAFT") {
            pageData.publishedAt = null;
        }

        const record = await repository.update(
            uuid,
            pageData,
            media
        );

        return serializePage(record);
    } catch (error) {
        handleDatabaseError(error);
    }
}

/**
 * Delete page.
 */
export async function remove(uuid) {
    validateUuid(uuid);

    try {
        const existing = await repository.findByUuid(uuid);

        if (!existing) {
            throw createError(
                "Page not found.",
                404
            );
        }

        await repository.remove(uuid);

        return true;
    } catch (error) {
        handleDatabaseError(error);
    }
}
