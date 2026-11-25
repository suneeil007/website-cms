
import { z } from "zod";

import * as repository from "./category.repository.js";

import {
    createCategorySchema,
    updateCategorySchema,
    categoryUuidSchema,
    listCategoriesSchema,
    categoryTreeSchema,
} from "./category.validation.js";

import { CATEGORY_MESSAGES } from "./category.constants.js";

// ==========================================
// ERROR HANDLING
// ==========================================

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
}

function handleDatabaseError(error) {
    if (error.code === "P2002") {
        throw createError(
            CATEGORY_MESSAGES.DUPLICATE_SLUG,
            409
        );
    }

    if (error.code === "P2025") {
        throw createError(
            CATEGORY_MESSAGES.NOT_FOUND,
            404
        );
    }

    if (error.code === "P2003") {
        throw createError(
            "Category cannot be deleted because it is referenced by another record.",
            409
        );
    }

    throw error;
}

// ==========================================
// SLUG GENERATION
// ==========================================

function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 180)
        .replace(/-+$/g, "") || "category";
}

async function generateUniqueSlug(name, excludeUuid = null) {
    const baseSlug = slugify(name);

    let slug = baseSlug;
    let counter = 1;

    while (await repository.findBySlug(slug, excludeUuid)) {
        counter++;

        const suffix = `-${counter}`;

        slug = `${baseSlug.slice(0, 180 - suffix.length)}${suffix}`;
    }

    return slug;
}

// ==========================================
// UUID VALIDATION
// ==========================================

function validateUuid(uuid) {
    return categoryUuidSchema.parse({ uuid }).uuid;
}

// ==========================================
// MEDIA SERIALIZATION
// ==========================================

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

// ==========================================
// CATEGORY SERIALIZATION
// ==========================================

function serializeCategory(category) {
    if (!category) return null;

    const {
        id,
        parentId,
        media,
        parent,
        _count,
        ...categoryData
    } = category;

    return {
        ...categoryData,

        parent: parent
            ? {
                uuid: parent.uuid,
                name: parent.name,
                slug: parent.slug,
                module: parent.module,
            }
            : null,

        media: serializeMedia(media),

        childrenCount: _count?.children ?? 0,
    };
}

// ==========================================
// FIND PARENT
// ==========================================

async function resolveParent(
    parentUuid,
    module,
    currentUuid = null
) {
    if (parentUuid === null || parentUuid === undefined) {
        return null;
    }

    const parent = await repository.findByUuid(parentUuid);

    if (!parent) {
        throw createError(
            CATEGORY_MESSAGES.PARENT_NOT_FOUND,
            404
        );
    }

    if (currentUuid && parent.uuid === currentUuid) {
        throw createError(
            CATEGORY_MESSAGES.CANNOT_SET_SELF_AS_PARENT,
            422
        );
    }

    if (parent.module !== module) {
        throw createError(
            CATEGORY_MESSAGES.DIFFERENT_MODULE_PARENT,
            422
        );
    }

    return parent;
}

// ==========================================
// CIRCULAR HIERARCHY CHECK
// ==========================================

async function validateParentHierarchy(parent, currentUuid) {
    let currentParent = parent;

    while (currentParent) {
        if (currentParent.uuid === currentUuid) {
            throw createError(
                CATEGORY_MESSAGES.CANNOT_CREATE_CIRCULAR_HIERARCHY,
                422
            );
        }

        currentParent = currentParent.parent?.uuid
            ? await repository.findByUuid(
                currentParent.parent.uuid
            )
            : null;
    }
}

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export async function getAll(query = {}) {
    const filters = listCategoriesSchema.parse(query);

    let parentId;

    if (filters.parent_uuid) {
        const parent = await repository.findByUuid(
            filters.parent_uuid
        );

        if (!parent) {
            throw createError(
                CATEGORY_MESSAGES.PARENT_NOT_FOUND,
                404
            );
        }

        if (
            filters.module &&
            parent.module !== filters.module
        ) {
            throw createError(
                CATEGORY_MESSAGES.DIFFERENT_MODULE_FILTER,
                422
            );
        }

        parentId = parent.id;
    }

    const result = await repository.findAll({
        page: filters.page,
        perPage: filters.per_page,
        search: filters.search,
        module: filters.module,
        isActive: filters.isActive,
        parentId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
    });

    return {
        items: result.items.map(serializeCategory),

        pagination: {
            page: filters.page,
            per_page: filters.per_page,
            total: result.total,

            last_page: Math.max(
                1,
                Math.ceil(result.total / filters.per_page)
            ),
        },
    };
}

// ==========================================
// GET CATEGORY BY UUID
// ==========================================

export async function getByUuid(uuid) {
    validateUuid(uuid);

    const category = await repository.findByUuid(uuid);

    if (!category) {
        throw createError(
            CATEGORY_MESSAGES.NOT_FOUND,
            404
        );
    }

    return serializeCategory(category);
}

// ==========================================
// CREATE CATEGORY
// ==========================================

export async function create(payload) {
    const data = createCategorySchema.parse(payload);

    try {
        const slug = await generateUniqueSlug(data.name);

        const parent = await resolveParent(
            data.parent_uuid,
            data.module
        );

        const categoryData = {
            name: data.name,
            slug,
            module: data.module,

            description: data.description ?? null,

            parentId: parent?.id ?? null,

            isActive: data.isActive,
            sortOrder: data.sortOrder,

            seoTitle: data.seoTitle ?? null,
            seoDescription: data.seoDescription ?? null,
        };

        const category = await repository.create(categoryData);

        return serializeCategory(category);
    } catch (error) {
        handleDatabaseError(error);
    }
}

// ==========================================
// UPDATE CATEGORY
// ==========================================

export async function update(uuid, payload) {
    validateUuid(uuid);

    const data = updateCategorySchema.parse(payload);

    try {
        const existing = await repository.findByUuid(uuid);

        if (!existing) {
            throw createError(
                CATEGORY_MESSAGES.NOT_FOUND,
                404
            );
        }

        const targetModule = data.module ?? existing.module;

        const updateData = {};

        // Basic fields

        if (data.name !== undefined) {
            updateData.name = data.name;

            updateData.slug = await generateUniqueSlug(
                data.name,
                uuid
            );
        }

        if (data.module !== undefined) {
            updateData.module = data.module;
        }

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }

        if (data.sortOrder !== undefined) {
            updateData.sortOrder = data.sortOrder;
        }

        if (data.seoTitle !== undefined) {
            updateData.seoTitle = data.seoTitle;
        }

        if (data.seoDescription !== undefined) {
            updateData.seoDescription = data.seoDescription;
        }

        // Validate explicitly supplied parent

        if (data.parent_uuid !== undefined) {
            const parent = await resolveParent(
                data.parent_uuid,
                targetModule,
                uuid
            );

            if (parent) {
                await validateParentHierarchy(parent, uuid);
            }

            updateData.parentId = parent?.id ?? null;
        }

        // Validate existing parent when module changes

        if (
            data.module !== undefined &&
            data.module !== existing.module &&
            data.parent_uuid === undefined &&
            existing.parent?.module !== undefined &&
            existing.parent.module !== targetModule
        ) {
            throw createError(
                CATEGORY_MESSAGES.CANNOT_CHANGE_MODULE_WITH_PARENT,
                422
            );
        }

        // Prevent module changes that invalidate children

        if (
            data.module !== undefined &&
            data.module !== existing.module
        ) {
            const children = await repository.findChildren(existing.id);

            if (
                children.some(
                    (child) => child.module !== targetModule
                )
            ) {
                throw createError(
                    CATEGORY_MESSAGES.CANNOT_CHANGE_MODULE_WITH_CHILDREN,
                    422
                );
            }
        }

        const category = await repository.update(
            uuid,
            updateData
        );

        return serializeCategory(category);
    } catch (error) {
        handleDatabaseError(error);
    }
}

// ==========================================
// DELETE CATEGORY
// ==========================================

export async function remove(uuid) {
    validateUuid(uuid);

    try {
        const existing = await repository.findByUuid(uuid);

        if (!existing) {
            throw createError(
                CATEGORY_MESSAGES.NOT_FOUND,
                404
            );
        }

        if (existing._count.children > 0) {
            throw createError(
                CATEGORY_MESSAGES.CANNOT_DELETE_HAS_CHILDREN,
                409
            );
        }

        await repository.remove(uuid);

        return true;
    } catch (error) {
        handleDatabaseError(error);
    }
}

// ==========================================
// GET CATEGORY TREE
// ==========================================

export async function getTree(query = {}) {
    const filters = categoryTreeSchema.parse(query);

    const categories = await repository.findAllForTree({
        module: filters.module,
        isActive: filters.isActive,
    });

    const categoryMap = new Map();

    for (const category of categories) {
        const {
            id,
            parentId,
            ...categoryData
        } = category;

        categoryMap.set(id, {
            ...categoryData,
            children: [],
        });
    }

    const tree = [];

    for (const category of categories) {
        const node = categoryMap.get(category.id);

        if (category.parentId !== null) {
            const parent = categoryMap.get(category.parentId);

            if (parent) {
                parent.children.push(node);
            } else {
                tree.push(node);
            }
        } else {
            tree.push(node);
        }
    }

    return tree;
}

// ==========================================
// GET CHILD CATEGORIES
// ==========================================

export async function getChildren(uuid) {
    validateUuid(uuid);

    const parent = await repository.findByUuid(uuid);

    if (!parent) {
        throw createError(
            CATEGORY_MESSAGES.NOT_FOUND,
            404
        );
    }

    const children = await repository.findChildren(parent.id);

    return children.map(serializeCategory);
}

// ==========================================
// GET CATEGORY ANCESTORS
// ==========================================

export async function getAncestors(uuid) {
    validateUuid(uuid);

    const category = await repository.findByUuid(uuid);

    if (!category) {
        throw createError(
            CATEGORY_MESSAGES.NOT_FOUND,
            404
        );
    }

    const ancestors = [];

    let currentParent = category.parent;

    while (currentParent) {
        ancestors.push({
            uuid: currentParent.uuid,
            name: currentParent.name,
            slug: currentParent.slug,
            module: currentParent.module,
        });

        const parentRecord = await repository.findByUuid(
            currentParent.uuid
        );

        currentParent = parentRecord?.parent ?? null;
    }

    return ancestors.reverse();
}
