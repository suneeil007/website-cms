
import * as repository from "./news.repository.js";

import {
    createNewsSchema,
    updateNewsSchema,
    newsUuidSchema,
    listNewsSchema,
} from "./news.validation.js";

import {
    NEWS_STATUS,
    NEWS_DEFAULTS,
    NEWS_MEDIA_ROLES,
} from "./news.constants.js";

// ==========================================
// ERROR HELPER
// ==========================================

function createError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
}

// ==========================================
// SLUG GENERATOR
// ==========================================

function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

// ==========================================
// UNIQUE SLUG
// ==========================================

async function generateUniqueSlug(title, excludeUuid = null) {
    const baseSlug = slugify(title);

    if (!baseSlug) {
        throw createError(
            "Unable to generate a valid slug from the title.",
            422
        );
    }

    let slug = baseSlug;
    let counter = 1;

    while (await repository.findBySlug(slug, excludeUuid)) {
        counter++;
        slug = `${baseSlug}-${counter}`;
    }

    return slug;
}

// ==========================================
// VALIDATE CATEGORY
// ==========================================

async function validateCategory(uuid) {
    const category = await repository.findCategoryByUuid(uuid);

    if (!category) {
        throw createError("News category not found.", 404);
    }

    if (!category.isActive) {
        throw createError("Selected category is inactive.", 422);
    }

    if (category.module !== "NEWS") {
        throw createError(
            "Selected category does not belong to the NEWS module.",
            422
        );
    }

    return category;
}

// ==========================================
// VALIDATE AUTHOR
// ==========================================

function validateAuthor(authorId) {
    const id = Number(authorId);

    if (!Number.isInteger(id) || id <= 0) {
        throw createError(
            "Authenticated author is invalid.",
            401
        );
    }

    return id;
}

// ==========================================
// VALIDATE MEDIA
// ==========================================

async function validateMedia(mediaItems = []) {
    if (!Array.isArray(mediaItems)) {
        throw createError("Invalid media data.", 422);
    }

    const uuids = mediaItems.map((item) => item.uuid);

    if (new Set(uuids).size !== uuids.length) {
        throw createError(
            "Duplicate media UUIDs are not allowed.",
            422
        );
    }

    const featuredCount = mediaItems.filter(
        (item) => item.role === NEWS_MEDIA_ROLES.FEATURED
    ).length;

    if (featuredCount > 1) {
        throw createError(
            "Only one featured image is allowed.",
            422
        );
    }

    if (!uuids.length) {
        return [];
    }

    const mediaRecords = await repository.findMediaByUuids(uuids);

    if (mediaRecords.length !== uuids.length) {
        throw createError(
            "One or more selected media files do not exist.",
            404
        );
    }

    const mediaMap = new Map(
        mediaRecords.map((media) => [media.uuid, media])
    );

    return mediaItems.map((item, index) => {
        const media = mediaMap.get(item.uuid);

        return {
            mediaId: media.id,
            role: item.role ?? NEWS_DEFAULTS.MEDIA_ROLE,
            sortOrder: item.sortOrder ?? index,
        };
    });
}

// ==========================================
// SERIALIZE NEWS
// ==========================================

function serializeNews(news) {
    if (!news) {
        return null;
    }

    const media = (news.media ?? []).map((item) => ({
        uuid: item.media.uuid,
        originalName: item.media.originalName,
        fileName: item.media.fileName,
        mimeType: item.media.mimeType,
        extension: item.media.extension,
        size: item.media.size.toString(),
        altText: item.media.altText,
        caption: item.media.caption,
        role: item.role,
        sortOrder: item.sortOrder,
        url: `/api/v1/media/${item.media.uuid}/download`,
    }));

    return {
        uuid: news.uuid,
        title: news.title,
        slug: news.slug,
        excerpt: news.excerpt,
        content: news.content,
        status: news.status,

        category: news.category,

        author: news.author,

        seoTitle: news.seoTitle,
        seoDescription: news.seoDescription,

        publishedAt: news.publishedAt,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,

        featuredImage:
            media.find(
                (item) => item.role === NEWS_MEDIA_ROLES.FEATURED
            ) ?? null,

        media,
    };
}

// ==========================================
// GET ALL NEWS
// ==========================================

export async function getAll(query = {}) {
    const validated = listNewsSchema.parse({
        query,
    }).query;

    const {
        page,
        per_page,
        search,
        status,
        categoryUuid,
        authorUuid,
        sort_by,
        sort_order,
    } = validated;

    const { items, total } = await repository.findAll({
        page,
        perPage: per_page,
        search,
        status,
        categoryUuid,
        authorUuid,
        sortBy: sort_by,
        sortOrder: sort_order,
    });

    return {
        items: items.map(serializeNews),

        pagination: {
            currentPage: page,
            perPage: per_page,
            total,
            lastPage: Math.ceil(total / per_page),
            from: total ? (page - 1) * per_page + 1 : null,
            to: total
                ? Math.min(page * per_page, total)
                : null,
        },
    };
}

// ==========================================
// GET NEWS BY UUID
// ==========================================

export async function getByUuid(uuid) {
    newsUuidSchema.parse({
        params: { uuid },
    });

    const news = await repository.findByUuid(uuid);

    if (!news) {
        throw createError("News article not found.", 404);
    }

    return serializeNews(news);
}

// ==========================================
// CREATE NEWS
// ==========================================

export async function create(payload, authenticatedUser) {
    const validated = createNewsSchema.parse({
        body: payload,
    }).body;

    const authorId = validateAuthor(authenticatedUser?.id);

    const category = await validateCategory(
        validated.categoryUuid
    );

    const mediaItems = await validateMedia(
        validated.media ?? []
    );

    const slug = await generateUniqueSlug(validated.title);

    const status = validated.status ?? NEWS_STATUS.DRAFT;

    const data = {
        title: validated.title,
        slug,
        excerpt: validated.excerpt ?? null,
        content: validated.content,
        status,

        categoryId: category.id,
        authorId,

        seoTitle: validated.seoTitle ?? null,
        seoDescription: validated.seoDescription ?? null,

        publishedAt:
            status === NEWS_STATUS.PUBLISHED
                ? new Date()
                : null,
    };

    try {
        const news = await repository.create(
            data,
            mediaItems
        );

        return serializeNews(news);
    } catch (error) {
        if (error.code === "P2002") {
            throw createError(
                "News slug already exists.",
                409
            );
        }

        throw error;
    }
}

// ==========================================
// UPDATE NEWS
// ==========================================

export async function update(uuid, payload) {
    const validated = updateNewsSchema.parse({
        params: { uuid },
        body: payload,
    }).body;

    const existing = await repository.findByUuid(uuid);

    if (!existing) {
        throw createError("News article not found.", 404);
    }

    const data = {};

    if (validated.title !== undefined) {
        data.title = validated.title;

        if (validated.title !== existing.title) {
            data.slug = await generateUniqueSlug(
                validated.title,
                uuid
            );
        }
    }

    if (validated.excerpt !== undefined) {
        data.excerpt = validated.excerpt;
    }

    if (validated.content !== undefined) {
        data.content = validated.content;
    }

    if (validated.seoTitle !== undefined) {
        data.seoTitle = validated.seoTitle;
    }

    if (validated.seoDescription !== undefined) {
        data.seoDescription = validated.seoDescription;
    }

    if (validated.categoryUuid !== undefined) {
        const category = await validateCategory(
            validated.categoryUuid
        );

        data.categoryId = category.id;
    }

    if (validated.status !== undefined) {
        data.status = validated.status;

        if (validated.status === NEWS_STATUS.PUBLISHED) {
            data.publishedAt =
                existing.publishedAt ?? new Date();
        } else if (validated.status === NEWS_STATUS.DRAFT) {
            data.publishedAt = null;
        }
    }

    const mediaItems =
        validated.media !== undefined
            ? await validateMedia(validated.media)
            : undefined;

    try {
        const news = await repository.update(
            uuid,
            data,
            mediaItems
        );

        return serializeNews(news);
    } catch (error) {
        if (error.code === "P2002") {
            throw createError(
                "News slug already exists.",
                409
            );
        }

        if (error.code === "P2025") {
            throw createError("News article not found.", 404);
        }

        throw error;
    }
}

// ==========================================
// DELETE NEWS
// ==========================================

export async function remove(uuid) {
    newsUuidSchema.parse({
        params: { uuid },
    });

    try {
        await repository.remove(uuid);

        return {
            uuid,
        };
    } catch (error) {
        if (error.code === "P2025") {
            throw createError(
                "News article not found.",
                404
            );
        }

        throw error;
    }
}
