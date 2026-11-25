
export const MEDIA_TYPES = Object.freeze({
    IMAGE: "image",
    DOCUMENT: "document",
});

export const MEDIA_LIMITS = Object.freeze({
    IMAGE: 10 * 1024 * 1024,
    DOCUMENT: 25 * 1024 * 1024,
    MAX_FILES: 5,
});

export const IMAGE_FORMATS = Object.freeze({
    jpg: {
        mime: "image/jpeg",
        extension: "jpg",
    },
    jpeg: {
        mime: "image/jpeg",
        extension: "jpg",
    },
    png: {
        mime: "image/png",
        extension: "png",
    },
    webp: {
        mime: "image/webp",
        extension: "webp",
    },
    gif: {
        mime: "image/gif",
        extension: "gif",
    },
});

export const DOCUMENT_FORMATS = Object.freeze({
    pdf: {
        mime: "application/pdf",
        extension: "pdf",
    },
    docx: {
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
    },
    xlsx: {
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        extension: "xlsx",
    },
    pptx: {
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        extension: "pptx",
    },
});

export const ALLOWED_FORMATS = Object.freeze({
    ...IMAGE_FORMATS,
    ...DOCUMENT_FORMATS,
});
