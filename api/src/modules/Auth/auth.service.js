
import argon2 from "argon2";

import { env } from "../../config/env.js";

import { generateAccessToken } from "../../core/utils/jwt.js";

import {
    generateRefreshToken,
    hashToken,
} from "../../core/utils/token.js";

import { AUTH_CONSTANTS } from "./auth.constants.js";

import * as authRepository from "./auth.repository.js";

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function serializeAdmin(user) {
    const roles = user.roles.map(({ role }) => ({
        uuid: role.uuid,
        name: role.name,
        slug: role.slug,
    }));

    const permissions = [
        ...new Map(
            user.roles.flatMap(({ role }) =>
                role.permissions.map(({ permission }) => [
                    permission.slug,
                    {
                        uuid: permission.uuid,
                        name: permission.name,
                        slug: permission.slug,
                        module: permission.module,
                    },
                ])
            )
        ).values(),
    ];

    return {
        uuid: user.uuid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        roles,
        permissions,
    };
}

function getRefreshExpiry() {
    const days = Number(env.REFRESH_TOKEN_EXPIRES_DAYS);

    if (!Number.isFinite(days) || days <= 0) {
        throw createError(
            "Refresh token expiration is not configured correctly.",
            500
        );
    }

    return new Date(Date.now() + days * 86400000);
}

/**
 * LOGIN
 */
export async function login({
    email,
    password,
    userAgent,
    ipAddress,
}) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
        throw createError("Invalid email or password.", 401);
    }

    if (user.status === "INACTIVE") {
        throw createError("This account is inactive.", 403);
    }

    if (user.status === "LOCKED") {
        const lockExpired =
            user.lockedUntil &&
            user.lockedUntil <= new Date();

        if (!lockExpired) {
            throw createError(
                "Account temporarily locked. Please try again later.",
                423
            );
        }

        await authRepository.unlockAccount(user.id);

        user.status = "ACTIVE";
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
    }

    let passwordMatches;

    try {
        passwordMatches = await argon2.verify(
            user.passwordHash,
            password
        );
    } catch (error) {
        console.error("Password verification failed:", error);

        throw createError(
            "Unable to authenticate account.",
            500
        );
    }

    if (!passwordMatches) {
        const updatedUser =
            await authRepository.incrementFailedLoginAttempts(user.id);

        if (
            updatedUser.failedLoginAttempts >=
            AUTH_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS
        ) {
            const lockedUntil = new Date(
                Date.now() +
                AUTH_CONSTANTS.LOCK_DURATION_MINUTES * 60000
            );

            await authRepository.lockAccount(
                user.id,
                lockedUntil
            );

            throw createError(
                "Too many failed attempts. Account temporarily locked.",
                423
            );
        }

        throw createError("Invalid email or password.", 401);
    }

    await authRepository.resetFailedLoginAttempts(user.id);

    await authRepository.updateLastLogin(user.id);

    const lastLoginAt = new Date();

    const accessToken = await generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    await authRepository.createRefreshToken({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshExpiry(),
        userAgent: userAgent?.slice(0, 500) || null,
        ipAddress: ipAddress?.slice(0, 45) || null,
    });

    return {
        accessToken,
        refreshToken,
        admin: serializeAdmin({
            ...user,
            lastLoginAt,
        }),
    };
}

/**
 * REFRESH ACCESS TOKEN
 *
 * Every successful refresh:
 * 1. Validates the old refresh token.
 * 2. Revokes the old token.
 * 3. Creates a replacement token in the same family.
 * 4. Generates a new access token.
 */
export async function refresh({
    refreshToken,
    userAgent,
    ipAddress,
}) {
    if (!refreshToken) {
        throw createError(
            "Refresh token is required. Please log in again.",
            401
        );
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken =
        await authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
        throw createError(
            "Invalid refresh token. Please log in again.",
            401
        );
    }

    // Reuse detection: a previously revoked token was presented again.
    if (storedToken.revokedAt) {
        await authRepository.revokeTokenFamily(
            storedToken.familyId
        );

        throw createError(
            "Refresh token reuse detected. Please log in again.",
            401
        );
    }

    if (storedToken.expiresAt <= new Date()) {
        await authRepository.revokeRefreshToken(
            storedToken.id
        );

        throw createError(
            "Refresh token expired. Please log in again.",
            401
        );
    }

    const user = storedToken.user;

    if (!user || user.status !== "ACTIVE") {
        await authRepository.revokeTokenFamily(
            storedToken.familyId
        );

        throw createError(
            "Your account is unavailable. Please log in again.",
            401
        );
    }

    const newRefreshToken = generateRefreshToken();

    const newRefreshTokenData = {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        familyId: storedToken.familyId,
        expiresAt: getRefreshExpiry(),
        userAgent: userAgent?.slice(0, 500) || null,
        ipAddress: ipAddress?.slice(0, 45) || null,
    };

    const rotated = await authRepository.rotateRefreshToken(
        storedToken.id,
        newRefreshTokenData
    );

    if (!rotated) {
        // Another request may already have rotated this token.
        await authRepository.revokeTokenFamily(
            storedToken.familyId
        );

        throw createError(
            "Refresh token is no longer valid. Please log in again.",
            401
        );
    }

    const accessToken = await generateAccessToken(user);

    return {
        accessToken,
        refreshToken: newRefreshToken,
        admin: serializeAdmin(user),
    };
}

/**
 * LOGOUT
 *
 * Revoke the complete refresh-token family for this session.
 */
export async function logout(refreshToken) {
    if (!refreshToken) {
        return;
    }

    const token = await authRepository.findRefreshToken(
        hashToken(refreshToken)
    );

    if (!token) {
        return;
    }

    await authRepository.revokeTokenFamily(
        token.familyId
    );
}

/**
 * CURRENT ADMINISTRATOR
 */
export function getAuthenticatedAdmin(user) {
    if (!user || user.status !== "ACTIVE") {
        throw createError(
            "Authentication required.",
            401
        );
    }

    return user;
}
