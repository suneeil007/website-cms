
import prisma from "../../core/database/prisma.js";

// ==========================================
// PRISMA MODEL
// ==========================================

function getModel(db = prisma) {
    if (!db?.news) {
        throw new Error(
            "Prisma News model is not available. Run prisma generate."
        );
    }

    return db.news;
}

// ==========================================
// COMMON INCLUDE
// ==========================================

const newsInclude = {
    category: {
        select: {
            uuid: true,
            name: true,
            slug: true,
            module: true,
            isActive: true,
        },
    },

    author: {
        select: {
            uuid: true,
            firstName: true,
            lastName: true,
        },
    },

    media: {
        orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
        ],
        include: {
            media: {
                select: {
                    uuid: true,
                    originalName: true,
                    fileName: true,
                    mimeType: true,
                    extension: true,
                    size: true,
                    altText: true,
                    caption: true,
                },
            },
        },
    },
};

// ==========================================
// FIND ALL NEWS
// ==========================================

export async function findAll({
    page = 1,
    perPage = 15,
    search,
    status,
    categoryUuid,
    authorUuid,
    sortBy = "createdAt",
    sortOrder = "desc",
}) {
    const model = getModel();

    const where = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                excerpt: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (categoryUuid) {
        where.category = {
            uuid: categoryUuid,
        };
    }

    if (authorUuid) {
        where.author = {
            uuid: authorUuid,
        };
    }

    const skip = (page - 1) * perPage;

    const [items, total] = await prisma.$transaction([
        model.findMany({
            where,
            skip,
            take: perPage,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: newsInclude,
        }),

        model.count({ where }),
    ]);

    return { items, total };
}

// ==========================================
// FIND NEWS BY UUID
// ==========================================

export async function findByUuid(uuid) {
    return getModel().findUnique({
        where: { uuid },
        include: newsInclude,
    });
}

// ==========================================
// FIND NEWS BY SLUG
// ==========================================

export async function findBySlug(slug, excludeUuid = null) {
    return getModel().findFirst({
        where: {
            slug,
            ...(excludeUuid && {
                NOT: { uuid: excludeUuid },
            }),
        },
    });
}

// ==========================================
// FIND CATEGORY BY UUID
// ==========================================

export async function findCategoryByUuid(uuid) {
    return prisma.category.findUnique({
        where: { uuid },
    });
}

// ==========================================
// FIND MEDIA BY UUIDS
// ==========================================

export async function findMediaByUuids(uuids) {
    if (!uuids.length) {
        return [];
    }

    return prisma.media.findMany({
        where: {
            uuid: {
                in: uuids,
            },
        },
    });
}

// ==========================================
// CREATE NEWS WITH MEDIA
// ==========================================

export async function create(data, mediaItems = []) {
    return prisma.$transaction(async (tx) => {
        const news = await getModel(tx).create({
            data,
        });

        if (mediaItems.length) {
            await tx.newsMedia.createMany({
                data: mediaItems.map((item) => ({
                    newsId: news.id,
                    mediaId: item.mediaId,
                    role: item.role,
                    sortOrder: item.sortOrder,
                })),
            });
        }

        return getModel(tx).findUnique({
            where: { id: news.id },
            include: newsInclude,
        });
    });
}

// ==========================================
// UPDATE NEWS WITH MEDIA
// ==========================================

export async function update(uuid, data, mediaItems) {
    return prisma.$transaction(async (tx) => {
        const news = await getModel(tx).update({
            where: { uuid },
            data,
        });

        // Only synchronize media when explicitly provided.
        if (mediaItems !== undefined) {
            await tx.newsMedia.deleteMany({
                where: {
                    newsId: news.id,
                },
            });

            if (mediaItems.length) {
                await tx.newsMedia.createMany({
                    data: mediaItems.map((item) => ({
                        newsId: news.id,
                        mediaId: item.mediaId,
                        role: item.role,
                        sortOrder: item.sortOrder,
                    })),
                });
            }
        }

        return getModel(tx).findUnique({
            where: { uuid },
            include: newsInclude,
        });
    });
}

// ==========================================
// DELETE NEWS
// ==========================================

export async function remove(uuid) {
    return getModel().delete({
        where: { uuid },
    });
}
