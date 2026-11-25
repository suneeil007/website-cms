
// ==========================================
// NEWS CONSTANTS
// ==========================================

export const NEWS_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
});

// ==========================================
// PAGINATION
// ==========================================

export const NEWS_PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_PER_PAGE: 15,
    MAX_PER_PAGE: 100,
});

// ==========================================
// SORTING
// ==========================================

export const NEWS_SORT_FIELDS = Object.freeze([
    "createdAt",
    "updatedAt",
    "title",
    "publishedAt",
]);

export const NEWS_SORT_ORDERS = Object.freeze([
    "asc",
    "desc",
]);

// ==========================================
// MEDIA ROLES
// ==========================================

export const NEWS_MEDIA_ROLES = Object.freeze({
    FEATURED: "featured",
    GALLERY: "gallery",
});

// ==========================================
// DEFAULT VALUES
// ==========================================

export const NEWS_DEFAULTS = Object.freeze({
    STATUS: NEWS_STATUS.DRAFT,
    SORT_BY: "createdAt",
    SORT_ORDER: "desc",
    MEDIA_ROLE: NEWS_MEDIA_ROLES.GALLERY,
});
