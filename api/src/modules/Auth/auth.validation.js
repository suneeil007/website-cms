
import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please provide a valid email address.")
        .max(255)
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(1, "Password is required.")
        .max(128, "Password is too long."),
}).strict();

export const refreshSchema = z.object({}).strict();

export const logoutSchema = z.object({}).strict();
