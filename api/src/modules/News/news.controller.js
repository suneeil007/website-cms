
import * as service from "./news.service.js";

// ==========================================
// NEWS CONTROLLER
// ==========================================

export const index = async (req, res, next) => {
    try {
        const data = await service.getAll(req.query);

        return res.status(200).json({
            success: true,
            message: "News retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// SHOW NEWS
// ==========================================

export const show = async (req, res, next) => {
    try {
        const data = await service.getByUuid(
            req.params.uuid
        );

        return res.status(200).json({
            success: true,
            message: "News retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// CREATE NEWS
// ==========================================

export const store = async (req, res, next) => {
    try {
        const data = await service.create(
            req.body,
            req.user
        );

        return res.status(201).json({
            success: true,
            message: "News created successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// UPDATE NEWS
// ==========================================

export const update = async (req, res, next) => {
    try {
        const data = await service.update(
            req.params.uuid,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "News updated successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// DELETE NEWS
// ==========================================

export const destroy = async (req, res, next) => {
    try {
        const data = await service.remove(
            req.params.uuid
        );

        return res.status(200).json({
            success: true,
            message: "News deleted successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};
