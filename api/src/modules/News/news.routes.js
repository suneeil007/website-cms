
import { Router } from "express";

import * as controller from "./news.controller.js";

import {
    authenticate,
} from "../../core/middleware/authenticate.js";

import {
    authorize,
    requireRole,
    requirePermission,
} from "../../core/middleware/authorize.js";

const router = Router();

// ==========================================
// NEWS ROUTES
// ==========================================

// List news
router.get(
    "/",
    authenticate,
    requirePermission("news.view"),
    controller.index
);

// Create news
router.post(
    "/",
    authenticate,
    requirePermission("news.create"),
    controller.store
);

// Super admin only
router.get(
    "/admin-only",
    authenticate,
    requireRole("super-admin"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Super admin access granted.",
            data: null,
        });
    }
);

// Show news
router.get(
    "/:uuid",
    authenticate,
    requirePermission("news.view"),
    controller.show
);

// Update news
router.put(
    "/:uuid",
    authenticate,
    requirePermission("news.update"),
    controller.update
);

// Delete news
router.delete(
    "/:uuid",
    authenticate,
    authorize({
        permissions: ["news.delete"],
    }),
    controller.destroy
);

export default router;
