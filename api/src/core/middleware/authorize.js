
/**
 * CMS Authorization Middleware
 *
 * Requires authenticate.js to run first.
 *
 * Usage:
 * authorize({ roles: ["super-admin"] })
 * authorize({ permissions: ["pages.create"] })
 */

const SUPER_ADMIN_ROLE = "super-admin";

/**
 * Check whether user has a specific role.
 */
function hasRole(user, roles) {
    if (!roles.length) {
        return true;
    }

    const userRoles = user.roles.map((role) => role.slug);

    return roles.some((role) => userRoles.includes(role));
}

/**
 * Check whether user has required permissions.
 */
function hasPermission(user, permissions, requireAllPermissions = false) {
    if (!permissions.length) {
        return true;
    }

    const userPermissions = new Set(
        user.permissions.map((permission) => permission.slug)
    );

    return requireAllPermissions
        ? permissions.every((permission) =>
              userPermissions.has(permission)
          )
        : permissions.some((permission) =>
              userPermissions.has(permission)
          );
}

/**
 * Authorization middleware factory.
 *
 * @param {Object} options
 * @param {string[]} options.roles
 * @param {string[]} options.permissions
 * @param {boolean} options.requireAllPermissions
 * @param {boolean} options.allowSuperAdmin
 */
export function authorize({
    roles = [],
    permissions = [],
    requireAllPermissions = false,
    allowSuperAdmin = true,
} = {}) {
    return (req, res, next) => {
        try {
            // 1. Check authentication.
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required.",
                    data: null,
                });
            }

            // 2. Super Admin bypass.
            const isSuperAdmin = req.user.roles.some(
                (role) => role.slug === SUPER_ADMIN_ROLE
            );

            if (allowSuperAdmin && isSuperAdmin) {
                return next();
            }

            // 3. Validate role access.
            const roleAllowed = hasRole(req.user, roles);

            // 4. Validate permission access.
            const permissionAllowed = hasPermission(
                req.user,
                permissions,
                requireAllPermissions
            );

            // 5. Both configured requirements must pass.
            if (!roleAllowed || !permissionAllowed) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action.",
                    data: null,
                });
            }

            // 6. Authorized.
            return next();
        } catch (error) {
            return next(error);
        }
    };
}

/**
 * Role-based authorization helper.
 */
export function requireRole(...roles) {
    return authorize({ roles });
}

/**
 * Permission-based authorization helper.
 */
export function requirePermission(...permissions) {
    return authorize({ permissions });
}
