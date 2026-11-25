
import { Router } from "express";

import { authenticate } from "../../core/middleware/authenticate.js";

import {
    authorize,
    requireRole,
    requirePermission,
} from "../../core/middleware/authorize.js";

import * as controller from "./page.controller.js";

const router = Router();

// List pages
router.get(
    "/",
    authenticate,
    requirePermission("pages.view"),
    controller.index
);

// Create page
router.post(
    "/",
    authenticate,
    requirePermission("pages.create"),
    controller.store
);

// Super Admin only
router.get(
    "/admin-only",
    authenticate,
    requireRole("super-admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Super Admin access granted.",
            data: null,
        });
    }
);

// Get single page by UUID
router.get(
    "/:uuid",
    authenticate,
    requirePermission("pages.view"),
    controller.show
);

// Update page
router.put(
    "/:uuid",
    authenticate,
    requirePermission("pages.update"),
    controller.update
);

// Delete page
router.delete(
    "/:uuid",
    authenticate,
    authorize({
        permissions: ["pages.delete"],
    }),
    controller.destroy
);

export default router;
