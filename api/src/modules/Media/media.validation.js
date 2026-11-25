
import { z } from "zod";

export const mediaUuidSchema = z.object({
    uuid: z.string().uuid("Invalid media UUID"),
});

export const updateMediaSchema = z.object({
    altText: z.string()
        .trim()
        .max(255)
        .nullable()
        .optional(),

    caption: z.string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    }
);

export const listMediaSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),

    per_page: z.coerce.number().int().min(1).max(100).default(15),

    type: z.enum(["image", "document"]).optional(),

    search: z.string().trim().max(200).optional(),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const attachMediaSchema = z.object({
    pageUuid: z.string().uuid("Invalid page UUID"),

    role: z.string()
        .trim()
        .min(1)
        .max(50)
        .optional(),

    sortOrder: z.coerce.number()
        .int()
        .min(0)
        .default(0),
});
