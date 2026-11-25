
import * as service from "./category.service.js";

import { CATEGORY_MESSAGES } from "./category.constants.js";

// ==========================================
// LIST CATEGORIES
// ==========================================

export async function index(req, res, next) {
    try {
        const result = await service.getAll(req.query);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.LISTED,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// CATEGORY TREE
// ==========================================

export async function tree(req, res, next) {
    try {
        const result = await service.getTree(req.query);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.TREE,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// GET SINGLE CATEGORY
// ==========================================

export async function show(req, res, next) {
    try {
        const result = await service.getByUuid(req.params.uuid);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.FOUND,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// CREATE CATEGORY
// ==========================================

export async function store(req, res, next) {
    try {
        const result = await service.create(req.body);

        return res.status(201).json({
            success: true,
            message: CATEGORY_MESSAGES.CREATED,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// UPDATE CATEGORY
// ==========================================

export async function update(req, res, next) {
    try {
        const result = await service.update(
            req.params.uuid,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.UPDATED,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// DELETE CATEGORY
// ==========================================

export async function destroy(req, res, next) {
    try {
        await service.remove(req.params.uuid);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.DELETED,
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// CHILD CATEGORIES
// ==========================================

export async function children(req, res, next) {
    try {
        const result = await service.getChildren(req.params.uuid);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.CHILDREN,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// ==========================================
// CATEGORY ANCESTORS
// ==========================================

export async function ancestors(req, res, next) {
    try {
        const result = await service.getAncestors(req.params.uuid);

        return res.status(200).json({
            success: true,
            message: CATEGORY_MESSAGES.ANCESTORS,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
