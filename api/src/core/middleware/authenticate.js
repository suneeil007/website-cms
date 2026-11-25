
import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../database/prisma.js";

/**
 * Authenticate requests using JWT access tokens.
 *
 * Expected header:
 * Authorization: Bearer <access_token>
 */
export async function authenticate(req, res, next) {
    try {
        // 1. Read Authorization header.
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please provide an access token.",
                data: null,
            });
        }

        // 2. Extract access token.
        const accessToken = authorization.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing.",
                data: null,
            });
        }

        // 3. Verify JWT signature, expiration and token type.
        let payload;

        try {
            payload = await verifyAccessToken(accessToken);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token.",
                data: null,
            });
        }

        // 4. Validate token subject.
        const userId = Number(payload.sub);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token.",
                data: null,
            });
        }

        // 5. Find authenticated user with roles and permissions.
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                uuid: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                uuid: true,
                                name: true,
                                slug: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                uuid: true,
                                                name: true,
                                                slug: true,
                                                module: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // 6. Reject deleted or unavailable users.
        if (!user || user.status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "Your account is unavailable. Please log in again.",
                data: null,
            });
        }

        // 7. Extract roles.
        const roles = user.roles.map(({ role }) => ({
            uuid: role.uuid,
            name: role.name,
            slug: role.slug,
        }));

        // 8. Extract unique permissions.
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

        // 9. Attach authenticated user to request.
        req.user = {
            id: user.id,
            uuid: user.uuid,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            status: user.status,
            roles,
            permissions,
        };

        // 10. Continue to controller.
        next();
    } catch (error) {
        next(error);
    }
}
