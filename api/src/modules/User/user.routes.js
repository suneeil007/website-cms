import { Router } from "express";
import { authenticate } from "../../core/middleware/authenticate.js";

const router = Router();

router.get("/profile", authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated user retrieved successfully.",
        data: req.user,
    });
});

export default router;