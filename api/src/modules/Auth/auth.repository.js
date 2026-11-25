
import prisma from "../../core/database/prisma.js";

const userWithPermissions = {
    roles: {
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        },
    },
};

export function findByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
        include: userWithPermissions,
    });
}

export function findById(id) {
    return prisma.user.findUnique({
        where: { id },
        include: userWithPermissions,
    });
}

export function incrementFailedLoginAttempts(id) {
    return prisma.user.update({
        where: { id },
        data: {
            failedLoginAttempts: { increment: 1 },
        },
    });
}

export function lockAccount(id, lockedUntil) {
    return prisma.user.update({
        where: { id },
        data: {
            status: "LOCKED",
            lockedUntil,
        },
    });
}

export function resetFailedLoginAttempts(id) {
    return prisma.user.update({
        where: { id },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
        },
    });
}

export function updateLastLogin(id) {
    return prisma.user.update({
        where: { id },
        data: {
            lastLoginAt: new Date(),
        },
    });
}

export function unlockAccount(id) {
    return prisma.user.update({
        where: { id },
        data: {
            status: "ACTIVE",
            failedLoginAttempts: 0,
            lockedUntil: null,
        },
    });
}

export function createRefreshToken(data) {
    return prisma.refreshToken.create({
        data,
    });
}

export function findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
            user: {
                include: userWithPermissions,
            },
        },
    });
}

/**
 * Atomically revoke the old token and create its replacement.
 * A token can only be rotated once.
 */
export async function rotateRefreshToken(oldTokenId, newTokenData) {
    return prisma.$transaction(async (tx) => {
        const now = new Date();

        const revoked = await tx.refreshToken.updateMany({
            where: {
                id: oldTokenId,
                revokedAt: null,
                expiresAt: { gt: now },
            },
            data: {
                revokedAt: now,
                lastUsedAt: now,
            },
        });

        if (revoked.count !== 1) {
            return false;
        }

        await tx.refreshToken.create({
            data: newTokenData,
        });

        return true;
    });
}

export function revokeRefreshToken(id) {
    return prisma.refreshToken.updateMany({
        where: {
            id,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}

export function revokeTokenFamily(familyId) {
    return prisma.refreshToken.updateMany({
        where: {
            familyId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}

export function revokeAllRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}
