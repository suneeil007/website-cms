
import path from "node:path";

import * as service from "./media.service.js";

// ==========================================
// UPLOAD
// ==========================================

export async function upload(req, res, next) {
    try {
        const data = await service.upload(req.files);

        res.status(201).json({
            success: true,
            message: "Media uploaded successfully.",
            data,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// LIST
// ==========================================

export async function index(req, res, next) {
    try {
        const data = await service.getAll(req.query);

        res.json({
            success: true,
            message: "Media list retrieved successfully.",
            data,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// SHOW
// ==========================================

export async function show(req, res, next) {
    try {
        const data = await service.getByUuid(
            req.params.uuid
        );

        res.json({
            success: true,
            message: "Media retrieved successfully.",
            data,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// UPDATE
// ==========================================

export async function update(req, res, next) {
    try {
        const data = await service.update(
            req.params.uuid,
            req.body
        );

        res.json({
            success: true,
            message: "Media updated successfully.",
            data,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// DELETE
// ==========================================

export async function destroy(req, res, next) {
    try {
        await service.remove(req.params.uuid);

        res.json({
            success: true,
            message: "Media deleted successfully.",
            data: null,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// ATTACH
// ==========================================

export async function attach(req, res, next) {
    try {
        const data = await service.attach(
            req.params.uuid,
            req.body
        );

        res.json({
            success: true,
            message: "Media attached to page successfully.",
            data,
        });

    } catch (error) {
        next(error);
    }
}

// ==========================================
// DOWNLOAD / PREVIEW
// ==========================================

export async function download(req, res, next) {
    try {
        const file = await service.getDownload(
            req.params.uuid
        );

        const disposition = file.isImage
            ? "inline"
            : "attachment";

        const filename = path
            .basename(file.originalName)
            .replace(/["\\\r\n]/g, "_");

        res.set({
            "Content-Type": file.mimeType,

            "Content-Disposition":
                `${disposition}; filename="${filename}"`,

            "X-Content-Type-Options": "nosniff",

            "Cache-Control": "private, no-store",

            "Content-Security-Policy": "sandbox",
        });

        res.sendFile(
            file.absolutePath,
            (error) => {
                if (error && !res.headersSent) {
                    next(error);
                }
            }
        );

    } catch (error) {
        next(error);
    }
}


export async function detach(req, res, next) {
    try {
        const result = await service.detach(
            req.params.uuid,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Media detached successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
