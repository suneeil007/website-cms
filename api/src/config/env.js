import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    // Application
    APP_NAME: z.string().default("Website CMS API"),

    APP_ENV: z.enum([
        "development",
        "production",
        "test",
    ]).default("development"),

    PORT: z.coerce.number().int().positive().default(5000),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // CORS
    CORS_ORIGIN: z.string()
        .default("http://localhost:5173")
        .transform((value) =>
            value.split(",").map((origin) => origin.trim()).filter(Boolean)
        )
        .refine(
            (origins) => origins.length > 0,
            "At least one CORS origin is required"
        ),

    // Authentication
    JWT_ACCESS_SECRET: z.string()
        .min(64, "JWT_ACCESS_SECRET must be at least 64 characters"),

    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number()
        .int()
        .positive()
        .default(7),

    REFRESH_TOKEN_COOKIE_NAME: z.string()
        .default("cms_refresh_token"),

    // Cookie security
    COOKIE_SECURE: z.enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),

    COOKIE_SAME_SITE: z.enum([
        "strict",
        "lax",
        "none",
    ]).default("lax"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment configuration:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
}

const parsedEnv = result.data;

// Production security validation
if (parsedEnv.APP_ENV === "production") {
    if (!parsedEnv.COOKIE_SECURE) {
        console.error(
            "COOKIE_SECURE must be true in production."
        );
        process.exit(1);
    }

    if (parsedEnv.COOKIE_SAME_SITE === "none" &&
        !parsedEnv.COOKIE_SECURE) {
        console.error(
            "SameSite=None requires Secure cookies."
        );
        process.exit(1);
    }
}

export const env = Object.freeze(parsedEnv);
