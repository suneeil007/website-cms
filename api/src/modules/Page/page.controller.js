
import * as service from "./page.service.js";

export async function index(req, res, next) {
    try {
        const data = await service.getAll(req.query);

        return res.json({
            success: true,
            message: "Page list retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function show(req, res, next) {
    try {
        const data = await service.getByUuid(req.params.uuid);

        return res.json({
            success: true,
            message: "Page retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function store(req, res, next) {
    try {
        const data = await service.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Page created successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const data = await service.update(
            req.params.uuid,
            req.body
        );

        return res.json({
            success: true,
            message: "Page updated successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        await service.remove(req.params.uuid);

        return res.json({
            success: true,
            message: "Page deleted successfully.",
            data: null,
        });
    } catch (error) {
        next(error);
    }
}
