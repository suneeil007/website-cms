
import prisma from "../../core/database/prisma.js";

function getModel() {
    const model = prisma.page;

    if (!model) {
        throw new Error(
            'Prisma model "Page" is not configured. ' +
            "Check prisma/schema.prisma and regenerate Prisma Client."
        );
    }

    return model;
}

/**
 * Include attached media in Page responses.
 */
const mediaInclude = {
    media: {
        orderBy: {
            sortOrder: "asc",
        },
        include: {
            media: true,
        },
    },
};

/**
 * Resolve media UUIDs and create PageMedia records.
 *
 * Media records are never created or deleted here.
 */
async function attachMedia(tx, pageId, attachments) {
    if (!attachments.length) {
        return;
    }

    const mediaUuids = attachments.map((item) => item.uuid);

    const mediaRecords = await tx.media.findMany({
        where: {
            uuid: {
                in: mediaUuids,
            },
        },
        select: {
            id: true,
            uuid: true,
        },
    });

    if (mediaRecords.length !== mediaUuids.length) {
        const found = new Set(
            mediaRecords.map((item) => item.uuid)
        );

        const missing = mediaUuids.filter(
            (uuid) => !found.has(uuid)
        );

        const error = new Error(
            `Media not found: ${missing.join(", ")}`
        );

        error.statusCode = 422;
        throw error;
    }

    const mediaIdMap = new Map(
        mediaRecords.map((item) => [
            item.uuid,
            item.id,
        ])
    );

    await tx.pageMedia.createMany({
        data: attachments.map((attachment) => ({
            pageId,
            mediaId: mediaIdMap.get(attachment.uuid),
            role: attachment.role ?? null,
            sortOrder: attachment.sortOrder ?? 0,
        })),
    });
}

/**
 * Get paginated pages.
 *
 * Search supports both title and slug.
 */
export async function findAll({
    page,
    perPage,
    search,
    status,
    sortBy,
    sortOrder,
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
                slug: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [items, total] = await prisma.$transaction([
        model.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: mediaInclude,
        }),

        model.count({
            where,
        }),
    ]);

    return {
        items,
        total,
    };
}

/**
 * Find page by UUID.
 */
export function findByUuid(uuid) {
    return getModel().findUnique({
        where: {
            uuid,
        },
        include: mediaInclude,
    });
}

/**
 * Find page by slug.
 *
 * Optionally exclude a UUID during updates.
 */
export function findBySlug(slug, excludeUuid = null) {
    return getModel().findFirst({
        where: {
            slug,
            ...(excludeUuid
                ? {
                    uuid: {
                        not: excludeUuid,
                    },
                }
                : {}),
        },
        select: {
            uuid: true,
        },
    });
}

/**
 * Create page and media attachments atomically.
 */
export async function create(data, attachments = []) {
    return prisma.$transaction(async (tx) => {
        const page = await tx.page.create({
            data,
        });

        await attachMedia(
            tx,
            page.id,
            attachments
        );

        return tx.page.findUnique({
            where: {
                id: page.id,
            },
            include: mediaInclude,
        });
    });
}

/**
 * Update page and optionally synchronize media.
 *
 * attachments === undefined:
 *     Preserve existing attachments.
 *
 * attachments === []:
 *     Remove all attachments.
 *
 * attachments contains items:
 *     Replace existing attachments.
 */
export async function update(
    uuid,
    data,
    attachments = undefined
) {
    return prisma.$transaction(async (tx) => {
        const page = await tx.page.update({
            where: {
                uuid,
            },
            data,
        });

        if (attachments !== undefined) {
            await tx.pageMedia.deleteMany({
                where: {
                    pageId: page.id,
                },
            });

            await attachMedia(
                tx,
                page.id,
                attachments
            );
        }

        return tx.page.findUnique({
            where: {
                id: page.id,
            },
            include: mediaInclude,
        });
    });
}

/**
 * Delete page.
 *
 * PageMedia records are automatically deleted
 * through the database cascade relationship.
 */
export function remove(uuid) {
    return getModel().delete({
        where: {
            uuid,
        },
    });
}
