
import { z } from "zod";

import {
    NEWS_STATUS,
    NEWS_SORT_FIELDS,
    NEWS_SORT_ORDERS,
    NEWS_PAGINATION,
} from "./news.constants.js";

// ==========================================
// REUSABLE SCHEMAS
// ==========================================

const uuidSchema = z
    .string()
    .uuid("Invalid UUID format.");

const titleSchema = z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters.");

const excerptSchema = z
    .string()
    .trim()
    .max(5000, "Excerpt cannot exceed 5000 characters.")
    .nullable()
    .optional();

const contentSchema = z
    .string()
    .trim()
    .min(1, "Content is required.");

const seoTitleSchema = z
    .string()
    .trim()
    .max(200, "SEO title cannot exceed 200 characters.")
    .nullable()
    .optional();

const seoDescriptionSchema = z
    .string()
    .trim()
    .max(320, "SEO description cannot exceed 320 characters.")
    .nullable()
    .optional();

const statusSchema = z.enum(
    Object.values(NEWS_STATUS),
    {
        error: "Invalid news status.",
    }
);

const mediaSchema = z.object({
    uuid: uuidSchema,
    role: z.enum(["featured", "gallery"]).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
});

// ==========================================
// CREATE NEWS VALIDATION
// ==========================================

export const createNewsSchema = z.object({
    body: z.object({
        title: titleSchema,

        excerpt: excerptSchema,

        content: contentSchema,

        status: statusSchema.optional(),

        categoryUuid: uuidSchema,

        media: z.array(mediaSchema).max(
            20,
            "A maximum of 20 media files is allowed."
        ).optional(),

        seoTitle: seoTitleSchema,

        seoDescription: seoDescriptionSchema,
    }).strict(),
});

// ==========================================
// UPDATE NEWS VALIDATION
// ==========================================

export const updateNewsSchema = z.object({
    params: z.object({
        uuid: uuidSchema,
    }),

    body: z.object({
        title: titleSchema.optional(),

        excerpt: excerptSchema,

        content: contentSchema.optional(),

        status: statusSchema.optional(),

        categoryUuid: uuidSchema.optional(),

        media: z.array(mediaSchema).max(
            20,
            "A maximum of 20 media files is allowed."
        ).optional(),

        seoTitle: seoTitleSchema,

        seoDescription: seoDescriptionSchema,
    }).strict().refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided.",
        }
    ),
});

// ==========================================
// NEWS UUID VALIDATION
// ==========================================

export const newsUuidSchema = z.object({
    params: z.object({
        uuid: uuidSchema,
    }),
});

// ==========================================
// LIST NEWS VALIDATION
// ==========================================

export const listNewsSchema = z.object({
    query: z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(NEWS_PAGINATION.DEFAULT_PAGE),

        per_page: z.coerce
            .number()
            .int()
            .min(1)
            .max(NEWS_PAGINATION.MAX_PER_PAGE)
            .default(NEWS_PAGINATION.DEFAULT_PER_PAGE),

        search: z.string().trim().max(200).optional(),

        status: statusSchema.optional(),

        categoryUuid: uuidSchema.optional(),

        authorUuid: uuidSchema.optional(),

        sort_by: z.enum(
            NEWS_SORT_FIELDS
        ).default("createdAt"),

        sort_order: z.enum(
            NEWS_SORT_ORDERS
        ).default("desc"),
    }).strict(),
});
