
export const PAGE_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
});

export const PAGE_STATUS_VALUES = Object.values(PAGE_STATUS);

export const PAGE_DEFAULTS = Object.freeze({
    STATUS: PAGE_STATUS.DRAFT,
    PAGE: 1,
    PER_PAGE: 15,
    MAX_PER_PAGE: 100,
});

export const PAGE_SORT_FIELDS = Object.freeze([
    "createdAt",
    "updatedAt",
    "title",
    "publishedAt",
]);

export const PAGE_SORT_ORDERS = Object.freeze([
    "asc",
    "desc",
]);
