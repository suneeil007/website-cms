import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import { env } from "./config/env.js";
import apiRoutes from "./routes/api.js";

import {
    notFoundHandler,
    errorHandler,
} from "./core/middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");

// ==========================================
// SECURITY HEADERS
// ==========================================

app.use(helmet());

// ==========================================
// CORS CONFIGURATION
// ==========================================

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
    ],
}));

// ==========================================
// REQUEST PARSING
// ==========================================

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "1mb",
}));

// ==========================================
// COOKIE PARSER
// Must run before API routes.
// ==========================================

app.use(cookieParser());

// ==========================================
// GENERAL API RATE LIMITER
// ==========================================

app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
}));

// ==========================================
// ROOT HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: `${env.APP_NAME} is running.`,
        data: {
            environment: env.APP_ENV,
        },
    });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/v1", apiRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
