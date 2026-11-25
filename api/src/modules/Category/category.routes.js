
import { Router } from "express";

import { authenticate } from "../../core/middleware/authenticate.js";

import {
    authorize,
    requireRole,
    requirePermission,
} from "../../core/middleware/authorize.js";

import * as controller from "./category.controller.js";

const router = Router();

// ==========================================
// CATEGORY TREE
// ==========================================

router.get(
    "/tree",
    authenticate,
    requirePermission("categories.view"),
    controller.tree
);

// ==========================================
// LIST CATEGORIES
// ==========================================

router.get(
    "/",
    authenticate,
    requirePermission("categories.view"),
    controller.index
);

// ==========================================
// CREATE CATEGORY
// ==========================================

router.post(
    "/",
    authenticate,
    requirePermission("categories.create"),
    controller.store
);

// ==========================================
// CHILD CATEGORIES
// ==========================================

router.get(
    "/:uuid/children",
    authenticate,
    requirePermission("categories.view"),
    controller.children
);

// ==========================================
// CATEGORY ANCESTORS
// ==========================================

router.get(
    "/:uuid/ancestors",
    authenticate,
    requirePermission("categories.view"),
    controller.ancestors
);

// ==========================================
// SUPER ADMIN ONLY
// ==========================================

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

// ==========================================
// GET CATEGORY BY UUID
// ==========================================

router.get(
    "/:uuid",
    authenticate,
    requirePermission("categories.view"),
    controller.show
);

// ==========================================
// UPDATE CATEGORY
// ==========================================

router.put(
    "/:uuid",
    authenticate,
    requirePermission("categories.update"),
    controller.update
);

// ==========================================
// DELETE CATEGORY
// ==========================================

router.delete(
    "/:uuid",
    authenticate,
    authorize({
        permissions: ["categories.delete"],
    }),
    controller.destroy
);

export default router;
