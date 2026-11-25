import { env } from "../../config/env.js";

export const AUTH_CONSTANTS = {
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    LOCK_DURATION_MINUTES: 15,

    REFRESH_TOKEN_EXPIRES_DAYS: env.REFRESH_TOKEN_EXPIRES_DAYS,

    REFRESH_TOKEN_COOKIE: env.REFRESH_TOKEN_COOKIE_NAME,

    REFRESH_TOKEN_COOKIE_OPTIONS: {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        path: "/api/v1/auth",
    },
};