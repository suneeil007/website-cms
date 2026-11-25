
import { Router } from "express";

import {
    loginController,
    refreshController,
    logoutController,
    meController,
} from "./auth.controller.js";

import {
    loginSchema,
    refreshSchema,
    logoutSchema,
} from "./auth.validation.js";

import { authenticate } from "../../core/middleware/authenticate.js";

const router = Router();

function validate(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.body ?? {});

        if (!validation.success) {
            return next(validation.error);
        }

        req.body = validation.data;

        next();
    };
}

// Login
router.post(
    "/login",
    validate(loginSchema),
    loginController
);

// Refresh access token
router.post(
    "/refresh",
    validate(refreshSchema),
    refreshController
);

// Logout
router.post(
    "/logout",
    validate(logoutSchema),
    logoutController
);

// Current authenticated administrator
router.get(
    "/me",
    authenticate,
    meController
);

export default router;
