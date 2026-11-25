import { Router } from "express";
import { authenticate } from "../../core/middleware/authenticate.js";
import { getDashboard } from "./dashboard.controller.js";

const router = Router();

// Dashboard overview
router.get("/overview", authenticate, getDashboard);

export default router;