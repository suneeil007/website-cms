
import prisma from "../../core/database/prisma.js";

// ==========================================
// COMMON CATEGORY INCLUDE
// ==========================================

const categoryInclude = {
    parent: {
        select: {
            uuid: true,
            name: true,
            slug: true,
            module: true,
        },
    },

    media: {
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "asc" },
        ],

        include: {
            media: true,
        },
    },

    _count: {
        select: {
            children: true,
        },
    },
};

// ==========================================
// FIND CATEGORY BY UUID
// ==========================================

export function findByUuid(uuid) {
    return prisma.category.findUnique({
        where: { uuid },
        include: categoryInclude,
    });
}

// ==========================================
// FIND CATEGORY BY SLUG
// ==========================================

export function findBySlug(slug, excludeUuid = null) {
    return prisma.category.findFirst({
        where: {
            slug,

            ...(excludeUuid && {
                uuid: {
                    not: excludeUuid,
                },
            }),
        },
    });
}

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export async function findAll({
    page = 1,
    perPage = 15,
    search,
    module,
    isActive,
    parentId,
    sortBy = "sortOrder",
    sortOrder = "asc",
} = {}) {
    const where = {};

    if (module) {
        where.module = module;
    }

    if (typeof isActive === "boolean") {
        where.isActive = isActive;
    }

    if (parentId !== undefined) {
        where.parentId = parentId;
    }

    if (search) {
        where.OR = [
            {
                name: {
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
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [items, total] = await prisma.$transaction([
        prisma.category.findMany({
            where,

            skip: (page - 1) * perPage,
            take: perPage,

            orderBy: [
                { [sortBy]: sortOrder },
                { name: "asc" },
            ],

            include: categoryInclude,
        }),

        prisma.category.count({ where }),
    ]);

    return {
        items,
        total,
    };
}

// ==========================================
// CREATE CATEGORY
// ==========================================

export function create(data) {
    return prisma.category.create({
        data,
        include: categoryInclude,
    });
}

// ==========================================
// UPDATE CATEGORY
// ==========================================

export function update(uuid, data) {
    return prisma.category.update({
        where: { uuid },
        data,
        include: categoryInclude,
    });
}

// ==========================================
// DELETE CATEGORY
// ==========================================

export function remove(uuid) {
    return prisma.category.delete({
        where: { uuid },
    });
}

// ==========================================
// FIND CHILD CATEGORIES
// ==========================================

export function findChildren(parentId) {
    return prisma.category.findMany({
        where: {
            parentId,
        },

        orderBy: [
            { sortOrder: "asc" },
            { name: "asc" },
        ],

        include: categoryInclude,
    });
}

// ==========================================
// FIND ALL CATEGORIES FOR TREE
// ==========================================

export function findAllForTree({
    module,
    isActive,
} = {}) {
    return prisma.category.findMany({
        where: {
            ...(module && { module }),

            ...(typeof isActive === "boolean" && {
                isActive,
            }),
        },

        orderBy: [
            { sortOrder: "asc" },
            { name: "asc" },
        ],

        select: {
            id: true,
            uuid: true,
            name: true,
            slug: true,
            module: true,
            description: true,
            parentId: true,
            isActive: true,
            sortOrder: true,
            seoTitle: true,
            seoDescription: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

// ==========================================
// FIND CATEGORY CHILDREN COUNT
// ==========================================

export function countChildren(parentId) {
    return prisma.category.count({
        where: {
            parentId,
        },
    });
}
