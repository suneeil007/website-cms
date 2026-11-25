
import {
    login,
    refresh,
    logout,
    getAuthenticatedAdmin,
} from "./auth.service.js";

import { AUTH_CONSTANTS } from "./auth.constants.js";

function setRefreshCookie(res, token) {
    res.cookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
        token,
        {
            ...AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_OPTIONS,
            maxAge:
                AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_DAYS *
                24 * 60 * 60 * 1000,
        }
    );
}

function clearRefreshCookie(res) {
    res.clearCookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE,
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_OPTIONS
    );
}

/**
 * POST /auth/login
 */
export async function loginController(req, res, next) {
    try {
        const result = await login({
            email: req.body.email,
            password: req.body.password,
            userAgent: req.get("user-agent"),
            ipAddress: req.ip,
        });

        setRefreshCookie(res, result.refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                accessToken: result.accessToken,
                tokenType: "Bearer",
                admin: result.admin,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/refresh
 */
export async function refreshController(req, res, next) {
    try {
        const refreshToken =
            req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

        const result = await refresh({
            refreshToken,
            userAgent: req.get("user-agent"),
            ipAddress: req.ip,
        });

        setRefreshCookie(res, result.refreshToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                accessToken: result.accessToken,
                tokenType: "Bearer",
                admin: result.admin,
            },
        });
    } catch (error) {
        if (error.statusCode === 401) {
            clearRefreshCookie(res);
        }

        next(error);
    }
}

/**
 * POST /auth/logout
 */
export async function logoutController(req, res, next) {
    try {
        const refreshToken =
            req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

        await logout(refreshToken);

        clearRefreshCookie(res);

        return res.status(200).json({
            success: true,
            message: "Logout successful.",
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /auth/me
 */
export async function meController(req, res, next) {
    try {
        const admin = getAuthenticatedAdmin(req.user);

        return res.status(200).json({
            success: true,
            message: "Administrator profile retrieved successfully.",
            data: {
                user: admin,
            },
        });
    } catch (error) {
        next(error);
    }
}
