
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        data: null,
    });
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode = error.statusCode || 500;
    let message = error.message;

    // Zod validation errors
    if (error.name === "ZodError") {
        statusCode = 422;
        message = "Validation failed.";

        return res.status(statusCode).json({
            success: false,
            message,
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
            data: null,
        });
    }

    // Prisma errors
    if (error.code === "P2002") {
        statusCode = 409;
        message = "A record with this value already exists.";
    }

    if (error.code === "P2025") {
        statusCode = 404;
        message = "Record not found.";
    }

    if (error.code === "P2003") {
        statusCode = 409;
        message = "This record is referenced by another record.";
    }

    // Invalid JSON request
    if (error.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Invalid JSON request body.";
    }

    if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
        statusCode = 500;
    }

    if (statusCode >= 500) {
        console.error(error);
        message = "Internal server error.";
    }

    res.status(statusCode).json({
        success: false,
        message,
        data: null,
    });
}
