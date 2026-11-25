
import { z } from "zod";

import {
    CATEGORY_DEFAULTS,
    CATEGORY_MODULES,
    CATEGORY_SORT_FIELDS,
    CATEGORY_SORT_ORDERS,
} from "./category.constants.js";

// ==========================================
// UUID PARAMETER
// ==========================================

export const categoryUuidSchema = z.object({
    uuid: z.string().uuid("Invalid category UUID."),
});

// ==========================================
// CREATE CATEGORY
// ==========================================

export const createCategorySchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Category name must be at least 2 characters.")
        .max(150, "Category name cannot exceed 150 characters."),

    module: z.enum(CATEGORY_MODULES)
        .default(CATEGORY_DEFAULTS.MODULE),

    description: z.string()
        .trim()
        .max(2000)
        .nullable()
        .optional(),

    parent_uuid: z.string()
        .uuid("Invalid parent category UUID.")
        .nullable()
        .optional(),

    isActive: z.boolean()
        .default(CATEGORY_DEFAULTS.IS_ACTIVE),

    sortOrder: z.number()
        .int()
        .min(0)
        .default(CATEGORY_DEFAULTS.SORT_ORDER),

    seoTitle: z.string()
        .trim()
        .max(200)
        .nullable()
        .optional(),

    seoDescription: z.string()
        .trim()
        .max(320)
        .nullable()
        .optional(),
});

// ==========================================
// UPDATE CATEGORY
// ==========================================

export const updateCategorySchema = createCategorySchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required for update.",
        }
    );

// ==========================================
// LIST CATEGORIES
// ==========================================

export const listCategoriesSchema = z.object({
    page: z.coerce.number()
        .int()
        .min(1)
        .default(CATEGORY_DEFAULTS.PAGE),

    per_page: z.coerce.number()
        .int()
        .min(1)
        .max(CATEGORY_DEFAULTS.MAX_PER_PAGE)
        .default(CATEGORY_DEFAULTS.PER_PAGE),

    search: z.string()
        .trim()
        .optional(),

    module: z.enum(CATEGORY_MODULES)
        .optional(),

    isActive: z.enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),

    parent_uuid: z.string()
        .uuid("Invalid parent category UUID.")
        .optional(),

    sortBy: z.enum(CATEGORY_SORT_FIELDS)
        .default("sortOrder"),

    sortOrder: z.enum(CATEGORY_SORT_ORDERS)
        .default("asc"),
});

// ==========================================
// CATEGORY TREE FILTERS
// ==========================================

export const categoryTreeSchema = z.object({
    module: z.enum(CATEGORY_MODULES)
        .optional(),

    isActive: z.enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
});
