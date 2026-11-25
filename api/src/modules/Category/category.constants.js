
export const CATEGORY_DEFAULTS = {
    MODULE: "NEWS",
    IS_ACTIVE: true,
    SORT_ORDER: 0,
    PAGE: 1,
    PER_PAGE: 15,
    MAX_PER_PAGE: 100,
};

export const CATEGORY_MODULES = [
    "NEWS",
    "PRODUCT",
    "SERVICE",
];

export const CATEGORY_SORT_FIELDS = [
    "name",
    "slug",
    "module",
    "sortOrder",
    "createdAt",
    "updatedAt",
];

export const CATEGORY_SORT_ORDERS = [
    "asc",
    "desc",
];

export const CATEGORY_MESSAGES = {
    CREATED: "Category created successfully.",
    UPDATED: "Category updated successfully.",
    DELETED: "Category deleted successfully.",
    FOUND: "Category retrieved successfully.",
    LISTED: "Categories retrieved successfully.",
    TREE: "Category tree retrieved successfully.",
    CHILDREN: "Child categories retrieved successfully.",
    ANCESTORS: "Category ancestors retrieved successfully.",

    NOT_FOUND: "Category not found.",
    DUPLICATE_SLUG: "A category with this slug already exists.",
    PARENT_NOT_FOUND: "Parent category not found.",
    INVALID_PARENT: "Invalid parent category.",

    DIFFERENT_MODULE_PARENT:
        "Parent category must belong to the same module.",

    DIFFERENT_MODULE_FILTER:
        "Parent category belongs to a different module.",

    CANNOT_CHANGE_MODULE_WITH_PARENT:
        "Cannot change module because the parent category belongs to another module.",

    CANNOT_CHANGE_MODULE_WITH_CHILDREN:
        "Cannot change module because child categories belong to another module.",

    CANNOT_DELETE_HAS_CHILDREN:
        "Cannot delete a category that has child categories.",

    CANNOT_SET_SELF_AS_PARENT:
        "A category cannot be its own parent.",

    CANNOT_CREATE_CIRCULAR_HIERARCHY:
        "This operation would create a circular category hierarchy.",
};
