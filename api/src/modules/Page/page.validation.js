
import { z } from "zod";

const PAGE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const PAGE_SORT_FIELDS = [
    "createdAt",
    "updatedAt",
    "title",
    "publishedAt",
];

/**
 * Optional nullable text field.
 */
function optionalText(maxLength) {
    return z.string()
        .trim()
        .max(maxLength)
        .nullable()
        .optional();
}

/**
 * Page media attachment validation.
 */
const pageMediaSchema = z.object({
    uuid: z.string().uuid("Invalid media UUID"),

    role: z.string()
        .trim()
        .min(1, "Media role cannot be empty")
        .max(50)
        .optional(),

    sortOrder: z.coerce.number()
        .int()
        .min(0)
        .default(0),
});

/**
 * Prevent duplicate media UUIDs in a single request.
 */
function uniqueMedia(items) {
    return new Set(items.map((item) => item.uuid)).size === items.length;
}

/**
 * Create Page validation.
 */
export const createPageSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Page title is required")
        .max(200),

    slug: z.string()
        .trim()
        .min(1)
        .max(220)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and hyphens only"
        )
        .optional(),

    excerpt: optionalText(10000),

    content: optionalText(1000000),

    status: z.enum(PAGE_STATUSES)
        .default("DRAFT"),

    seoTitle: optionalText(200),

    seoDescription: optionalText(320),

    media: z.array(pageMediaSchema)
        .max(50, "You can attach a maximum of 50 media files")
        .default([])
        .refine(uniqueMedia, {
            message: "Duplicate media UUIDs are not allowed",
        }),
});

/**
 * Update Page validation.
 */
export const updatePageSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Page title cannot be empty")
        .max(200)
        .optional(),

    slug: z.string()
        .trim()
        .min(1)
        .max(220)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and hyphens only"
        )
        .optional(),

    excerpt: optionalText(10000),

    content: optionalText(1000000),

    status: z.enum(PAGE_STATUSES)
        .optional(),

    seoTitle: optionalText(200),

    seoDescription: optionalText(320),

    media: z.array(pageMediaSchema)
        .max(50, "You can attach a maximum of 50 media files")
        .refine(uniqueMedia, {
            message: "Duplicate media UUIDs are not allowed",
        })
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    }
);

/**
 * Page UUID validation.
 */
export const pageUuidSchema = z.object({
    uuid: z.string().uuid("Invalid page UUID"),
});

/**
 * Page listing and filtering validation.
 */
export const listPagesSchema = z.object({
    page: z.coerce.number()
        .int()
        .min(1)
        .default(1),

    per_page: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(15),

    search: z.string()
        .trim()
        .max(200)
        .optional(),

    status: z.enum(PAGE_STATUSES)
        .optional(),

    sortBy: z.enum(PAGE_SORT_FIELDS)
        .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"])
        .default("desc"),
});
