
import prisma from "../../core/database/prisma.js";

// ==========================================
// LIST MEDIA
// ==========================================

export async function findAll({
    page,
    perPage,
    type,
    search,
    sortOrder,
}) {
    const where = {};

    if (type === "image") {
        where.mimeType = {
            startsWith: "image/",
        };
    }

    if (type === "document") {
        where.NOT = {
            mimeType: {
                startsWith: "image/",
            },
        };
    }

    if (search) {
        where.originalName = {
            contains: search,
            mode: "insensitive",
        };
    }

    const [items, total] = await prisma.$transaction([
        prisma.media.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,

            orderBy: {
                createdAt: sortOrder,
            },

            include: {
                _count: {
                    select: {
                        pages: true,
                    },
                },
            },
        }),

        prisma.media.count({ where }),
    ]);

    return {
        items,
        total,
    };
}

// ==========================================
// FIND MEDIA BY UUID
// ==========================================

export function findByUuid(uuid) {
    return prisma.media.findUnique({
        where: { uuid },

        include: {
            pages: {
                include: {
                    page: {
                        select: {
                            uuid: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
            },

            _count: {
                select: {
                    pages: true,
                },
            },
        },
    });
}

// ==========================================
// CREATE MEDIA
// ==========================================

export function create(data) {
    return prisma.media.create({
        data,

        include: {
            _count: {
                select: {
                    pages: true,
                },
            },
        },
    });
}

// ==========================================
// CREATE MULTIPLE MEDIA
// ==========================================

export function createMany(records) {
    return prisma.$transaction(
        records.map((data) =>
            prisma.media.create({
                data,

                include: {
                    _count: {
                        select: {
                            pages: true,
                        },
                    },
                },
            })
        )
    );
}

// ==========================================
// UPDATE MEDIA
// ==========================================

export function update(uuid, data) {
    return prisma.media.update({
        where: { uuid },

        data,

        include: {
            _count: {
                select: {
                    pages: true,
                },
            },
        },
    });
}

// ==========================================
// DELETE MEDIA SAFELY
// ==========================================

export function deleteRecord(uuid) {
    return prisma.$transaction(async (tx) => {
        const media = await tx.media.findUnique({
            where: { uuid },

            select: {
                id: true,
                storagePath: true,
            },
        });

        if (!media) {
            return null;
        }

        const attachmentCount = await tx.pageMedia.count({
            where: {
                mediaId: media.id,
            },
        });

        if (attachmentCount > 0) {
            return {
                deleted: false,
                reason: "attached",
            };
        }

        await tx.media.delete({
            where: { uuid },
        });

        return {
            deleted: true,
            storagePath: media.storagePath,
        };
    });
}

// ==========================================
// ATTACH MEDIA TO PAGE
// ==========================================

export function attachToPage({
    mediaId,
    pageId,
    role,
    sortOrder,
}) {
    return prisma.pageMedia.upsert({
        where: {
            pageId_mediaId: {
                pageId,
                mediaId,
            },
        },

        create: {
            pageId,
            mediaId,
            role,
            sortOrder,
        },

        update: {
            role,
            sortOrder,
        },
    });
}

// ==========================================
// FIND PAGE BY UUID
// ==========================================

export function findPageByUuid(uuid) {
    return prisma.page.findUnique({
        where: { uuid },

        select: {
            id: true,
        },
    });
}

// ==========================================
// FIND ATTACHMENT
// ==========================================

export function findAttachment(mediaId, pageId) {
    return prisma.pageMedia.findUnique({
        where: {
            pageId_mediaId: {
                pageId,
                mediaId,
            },
        },
    });
}


export function detachFromPage({ mediaId, pageId }) {
    return prisma.pageMedia.deleteMany({
        where: {
            mediaId,
            pageId,
        },
    });
}
