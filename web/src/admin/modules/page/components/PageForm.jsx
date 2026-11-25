
import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Save,
    ImagePlus,
    X,
    Image as ImageIcon,
    Loader2,
    Paperclip,
    FileText,
    File,
    Plus,
    AlertCircle,
} from "lucide-react";

import PageSeoForm from "./PageSeoForm";

import MediaPicker from "@/admin/modules/media/components/MediaPicker";

import api from "@/services/axios";

// ==========================================
// INITIAL VALUES
// ==========================================

const INITIAL_VALUES = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "DRAFT",
    seoTitle: "",
    seoDescription: "",
};

// ==========================================
// HELPERS
// ==========================================

function createSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function getMediaRecord(item) {
    return item?.media || item || null;
}

function getFeaturedMedia(page) {
    const featured = page?.media?.find((item) => {
        const role = String(item?.role || "").toUpperCase();

        return (
            role === "FEATURED_IMAGE" ||
            role === "FEATURED"
        );
    });

    const media = getMediaRecord(featured);

    return media?.uuid ? media : null;
}

function getPageAttachments(page) {
    return (page?.media || [])
        .filter(
            (item) =>
                String(item?.role || "").toUpperCase() ===
                "ATTACHMENT"
        )
        .map(getMediaRecord)
        .filter((media) => media?.uuid)
        .sort(
            (a, b) =>
                Number(a.sortOrder ?? a.sort_order ?? 0) -
                Number(b.sortOrder ?? b.sort_order ?? 0)
        );
}

function getMimeType(media) {
    return (
        media?.mimeType ||
        media?.mime_type ||
        media?.mime ||
        ""
    ).toLowerCase();
}

function getOriginalName(media) {
    return (
        media?.originalName ||
        media?.original_name ||
        media?.fileName ||
        media?.file_name ||
        "Untitled file"
    );
}

function getExtension(media) {
    const extension =
        media?.extension ||
        media?.fileExtension ||
        media?.file_extension;

    if (extension) {
        return String(extension).replace(".", "").toUpperCase();
    }

    const name = getOriginalName(media);

    return name.includes(".")
        ? name.split(".").pop().toUpperCase()
        : "FILE";
}

function getFileSize(media) {
    return Number(
        media?.size ??
        media?.fileSize ??
        media?.file_size ??
        0
    );
}

function formatFileSize(bytes = 0) {
    if (!bytes) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    return `${(
        bytes / Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function isImageFile(media) {
    return getMimeType(media).startsWith("image/");
}

// ==========================================
// COMPONENT
// ==========================================

export default function PageForm({
    initialData = null,
    onSubmit,
    isSubmitting = false,
    onCancel,
}) {
    const isEditing = Boolean(initialData?.uuid);

    // ======================================
    // FORM STATE
    // ======================================

    const [values, setValues] = useState(INITIAL_VALUES);

    const [errors, setErrors] = useState({});

    const [slugManuallyEdited, setSlugManuallyEdited] =
        useState(false);

    // ======================================
    // FEATURED IMAGE STATE
    // ======================================

    const [featuredImage, setFeaturedImage] = useState(null);

    const [featuredImageUrl, setFeaturedImageUrl] =
        useState(null);

    const [isImageLoading, setIsImageLoading] =
        useState(false);

    const [imageLoadError, setImageLoadError] =
        useState(false);

    const [isMediaPickerOpen, setIsMediaPickerOpen] =
        useState(false);

    // ======================================
    // ATTACHMENTS STATE
    // ======================================

    const [attachments, setAttachments] = useState([]);

    const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] =
        useState(false);

    // ======================================
    // INITIALIZE FORM
    // ======================================

    useEffect(() => {
        if (initialData) {
            setValues({
                ...INITIAL_VALUES,

                title: initialData.title || "",

                slug: initialData.slug || "",

                excerpt: initialData.excerpt || "",

                content: initialData.content || "",

                status: initialData.status || "DRAFT",

                seoTitle:
                    initialData.seoTitle ||
                    initialData.seo_title ||
                    "",

                seoDescription:
                    initialData.seoDescription ||
                    initialData.seo_description ||
                    "",
            });

            // Restore featured image.
            const existingFeatured =
                getFeaturedMedia(initialData);

            setFeaturedImage(existingFeatured);

            // Restore document attachments.
            const existingAttachments =
                getPageAttachments(initialData);

            setAttachments(existingAttachments);

            setSlugManuallyEdited(true);
        } else {
            setValues(INITIAL_VALUES);

            setFeaturedImage(null);

            setAttachments([]);

            setSlugManuallyEdited(false);
        }

        setErrors({});
    }, [initialData]);

    // ======================================
    // LOAD FEATURED IMAGE
    // ======================================

    useEffect(() => {
        if (!featuredImage?.uuid) {
            setFeaturedImageUrl(null);
            setIsImageLoading(false);
            setImageLoadError(false);

            return;
        }

        // Featured image must actually be an image.
        if (!isImageFile(featuredImage)) {
            setFeaturedImageUrl(null);
            setIsImageLoading(false);
            setImageLoadError(false);

            return;
        }

        let objectUrl = null;

        let cancelled = false;

        const loadImage = async () => {
            setIsImageLoading(true);

            setImageLoadError(false);

            setFeaturedImageUrl(null);

            try {
                const response = await api.get(
                    `/media/${featuredImage.uuid}/download`,
                    {
                        responseType: "blob",
                    }
                );

                if (cancelled) return;

                if (
                    !response.data ||
                    response.data.size === 0
                ) {
                    throw new Error(
                        "Image response is empty."
                    );
                }

                objectUrl = URL.createObjectURL(
                    response.data
                );

                setFeaturedImageUrl(objectUrl);
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Featured image loading failed:",
                    error.response?.data || error
                );

                setImageLoadError(true);

                setFeaturedImageUrl(null);
            } finally {
                if (!cancelled) {
                    setIsImageLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            cancelled = true;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [featuredImage?.uuid]);

    // ======================================
    // FORM FIELD UPDATE
    // ======================================

    const updateField = (field, value) => {
        setValues((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: "",
        }));
    };

    // ======================================
    // TITLE CHANGE
    // ======================================

    const handleTitleChange = (value) => {
        setValues((previous) => ({
            ...previous,

            title: value,

            ...(!slugManuallyEdited
                ? {
                    slug: createSlug(value),
                }
                : {}),
        }));

        setErrors((previous) => ({
            ...previous,
            title: "",
        }));
    };

    // ======================================
    // SLUG CHANGE
    // ======================================

    const handleSlugChange = (value) => {
        setSlugManuallyEdited(true);

        updateField("slug", createSlug(value));
    };

    // ======================================
    // FEATURED IMAGE SELECTION
    // ======================================

    const handleFeaturedImageSelect = (media) => {
        if (!media?.uuid) {
            console.error(
                "Invalid featured image selected:",
                media
            );

            return;
        }

        if (!isImageFile(media)) {
            console.error(
                "Featured media must be an image:",
                media
            );

            return;
        }

        // A file cannot have both roles on the same page.
        setAttachments((previous) =>
            previous.filter(
                (item) => item.uuid !== media.uuid
            )
        );

        setFeaturedImage(media);

        setIsMediaPickerOpen(false);
    };

    // ======================================
    // REMOVE FEATURED IMAGE
    // ======================================

    const handleRemoveFeaturedImage = () => {
        setFeaturedImage(null);

        setFeaturedImageUrl(null);

        setImageLoadError(false);

        setIsImageLoading(false);
    };

    // ======================================
    // ATTACHMENT SELECTION
    // ======================================

    const handleAttachmentSelect = (media) => {
        if (!media?.uuid) {
            console.error(
                "Invalid attachment selected:",
                media
            );

            return;
        }

        // Do not allow the featured image as attachment.
        if (featuredImage?.uuid === media.uuid) {
            setIsAttachmentPickerOpen(false);

            return;
        }

        setAttachments((previous) => {
            const alreadySelected = previous.some(
                (item) => item.uuid === media.uuid
            );

            if (alreadySelected) {
                return previous;
            }

            return [...previous, media];
        });

        setIsAttachmentPickerOpen(false);
    };

    // ======================================
    // REMOVE ATTACHMENT
    // ======================================

    const handleRemoveAttachment = (mediaUuid) => {
        setAttachments((previous) =>
            previous.filter(
                (item) => item.uuid !== mediaUuid
            )
        );
    };

    // ======================================
    // VALIDATION
    // ======================================

    const validate = () => {
        const nextErrors = {};

        if (!values.title.trim()) {
            nextErrors.title =
                "Page title is required.";
        } else if (values.title.trim().length > 200) {
            nextErrors.title =
                "Title cannot exceed 200 characters.";
        }

        if (!values.slug.trim()) {
            nextErrors.slug =
                "Page slug is required.";
        } else if (
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                values.slug
            )
        ) {
            nextErrors.slug =
                "Use lowercase letters, numbers, and hyphens only.";
        }

        if (values.seoTitle.length > 200) {
            nextErrors.seoTitle =
                "SEO title cannot exceed 200 characters.";
        }

        if (values.seoDescription.length > 320) {
            nextErrors.seoDescription =
                "SEO description cannot exceed 320 characters.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    // ======================================
    // FORM SUBMISSION
    // ======================================

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validate()) return;

        onSubmit({
            title: values.title.trim(),

            slug: values.slug.trim(),

            excerpt: values.excerpt.trim() || null,

            content: values.content || null,

            status: values.status,

            seoTitle: values.seoTitle.trim() || null,

            seoDescription:
                values.seoDescription.trim() || null,

            featuredMediaUuid:
                featuredImage?.uuid || null,

            attachmentMediaUuids: attachments
                .map((file) => file.uuid)
                .filter(Boolean),
        });
    };

    // ======================================
    // STYLES
    // ======================================

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-gray-700";

    const errorClass =
        "mt-1 text-xs text-red-600";

    // ======================================
    // RENDER
    // ======================================

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* HEADER */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
                        >
                            <ArrowLeft size={16} />
                            Back to pages
                        </button>

                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing
                                ? "Edit Page"
                                : "Create Page"}
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            {isEditing
                                ? "Update your page content and settings."
                                : "Create and publish a new website page."}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={16} />

                        {isSubmitting
                            ? "Saving..."
                            : isEditing
                                ? "Update Page"
                                : "Create Page"}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* LEFT COLUMN */}

                    <div className="space-y-6 xl:col-span-2">

                        {/* PAGE CONTENT */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-5 font-semibold text-gray-900">
                                Page Content
                            </h2>

                            <div className="space-y-4">

                                {/* TITLE */}

                                <div>
                                    <label className={labelClass}>
                                        Page Title{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={values.title}
                                        onChange={(event) =>
                                            handleTitleChange(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter page title"
                                        className={`${inputClass} ${
                                            errors.title
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.title && (
                                        <p className={errorClass}>
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* SLUG */}

                                <div>
                                    <label className={labelClass}>
                                        Slug{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                                        <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                                            /
                                        </span>

                                        <input
                                            type="text"
                                            value={values.slug}
                                            onChange={(event) =>
                                                handleSlugChange(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="about-us"
                                            className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                                        />
                                    </div>

                                    {errors.slug && (
                                        <p className={errorClass}>
                                            {errors.slug}
                                        </p>
                                    )}

                                    <p className="mt-1 text-xs text-gray-400">
                                        URL-friendly identifier for this page.
                                    </p>
                                </div>

                                {/* EXCERPT */}

                                <div>
                                    <label className={labelClass}>
                                        Excerpt
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={values.excerpt}
                                        onChange={(event) =>
                                            updateField(
                                                "excerpt",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Write a short page summary..."
                                        className={inputClass}
                                    />
                                </div>

                                {/* CONTENT */}

                                <div>
                                    <label className={labelClass}>
                                        Page Content
                                    </label>

                                    <textarea
                                        rows={16}
                                        value={values.content}
                                        onChange={(event) =>
                                            updateField(
                                                "content",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Write your page content here..."
                                        className={`${inputClass} resize-y font-mono`}
                                    />

                                    <p className="mt-1 text-xs text-gray-400">
                                        Plain text for now. Rich-text editor integration can be added next.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* SEO */}

                        <PageSeoForm
                            values={values}
                            onChange={(nextValues) =>
                                setValues((previous) => ({
                                    ...previous,
                                    ...nextValues,
                                }))
                            }
                        />
                    </div>

                    {/* RIGHT COLUMN */}

                    <div className="space-y-6">

                        {/* FEATURED IMAGE */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">
                                    Featured Image
                                </h2>

                                <ImageIcon
                                    size={18}
                                    className="text-gray-400"
                                />
                            </div>

                            {featuredImage ? (
                                <div className="space-y-3">

                                    <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">

                                        {isImageLoading && (
                                            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-gray-500">
                                                <Loader2
                                                    size={24}
                                                    className="animate-spin"
                                                />

                                                Loading image...
                                            </div>
                                        )}

                                        {imageLoadError && (
                                            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-red-500">
                                                <AlertCircle size={28} />

                                                Unable to load image.
                                            </div>
                                        )}

                                        {!isImageLoading &&
                                            !imageLoadError &&
                                            !featuredImageUrl && (
                                                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-gray-500">
                                                    <FileText size={28} />

                                                    {getExtension(featuredImage)}
                                                </div>
                                            )}

                                        {featuredImageUrl && (
                                            <img
                                                src={featuredImageUrl}
                                                alt={
                                                    featuredImage.altText ||
                                                    featuredImage.alt_text ||
                                                    getOriginalName(featuredImage)
                                                }
                                                className="h-48 w-full object-cover"
                                            />
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleRemoveFeaturedImage}
                                            className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50"
                                            title="Remove featured image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <p className="truncate text-sm font-medium text-gray-700">
                                        {getOriginalName(featuredImage)}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsMediaPickerOpen(true)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Replace Image
                                    </button>

                                    {imageLoadError && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFeaturedImage(
                                                    (previous) => ({
                                                        ...previous,
                                                    })
                                                )
                                            }
                                            className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Retry loading image
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsMediaPickerOpen(true)
                                    }
                                    className="flex min-h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50"
                                >
                                    <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600">
                                        <ImagePlus size={24} />
                                    </div>

                                    <span className="text-sm font-semibold text-gray-700">
                                        Select Featured Image
                                    </span>

                                    <span className="mt-1 text-xs text-gray-500">
                                        Choose an image from your media library
                                    </span>
                                </button>
                            )}
                        </section>

                        {/* FILE ATTACHMENTS */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">

                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        File Attachments
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Attach documents and other files to this page.
                                    </p>
                                </div>

                                <Paperclip
                                    size={18}
                                    className="text-gray-400"
                                />
                            </div>

                            {attachments.length > 0 ? (
                                <div className="mb-4 space-y-2">

                                    {attachments.map((file) => {
                                        const extension =
                                            getExtension(file);

                                        return (
                                            <div
                                                key={file.uuid}
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                    {getMimeType(file) ===
                                                    "application/pdf" ? (
                                                        <FileText size={20} />
                                                    ) : (
                                                        <File size={20} />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-800">
                                                        {getOriginalName(file)}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {extension}
                                                        {" · "}
                                                        {formatFileSize(
                                                            getFileSize(file)
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveAttachment(
                                                            file.uuid
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                    title="Remove attachment"
                                                >
                                                    <X size={17} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
                                    <Paperclip
                                        size={24}
                                        className="mx-auto mb-2 text-gray-400"
                                    />

                                    <p className="text-sm text-gray-600">
                                        No files attached
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Add files from your media library.
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsAttachmentPickerOpen(true)
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                <Plus size={16} />

                                Add Attachment
                            </button>
                        </section>

                        {/* PUBLISH SETTINGS */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-4 font-semibold text-gray-900">
                                Publish Settings
                            </h2>

                            <label className={labelClass}>
                                Page Status
                            </label>

                            <select
                                value={values.status}
                                onChange={(event) =>
                                    updateField(
                                        "status",
                                        event.target.value
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="DRAFT">
                                    Draft
                                </option>

                                <option value="PUBLISHED">
                                    Published
                                </option>

                                <option value="ARCHIVED">
                                    Archived
                                </option>
                            </select>

                            <p className="mt-2 text-xs text-gray-500">
                                {values.status === "PUBLISHED"
                                    ? "This page will be publicly available."
                                    : values.status === "ARCHIVED"
                                        ? "This page will be archived."
                                        : "This page will remain unpublished."}
                            </p>
                        </section>

                        {/* PAGE INFORMATION */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-2 font-semibold text-gray-900">
                                Page Information
                            </h2>

                            <div className="space-y-3 text-sm">

                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                        Status
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {values.status}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                        Content
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {values.content.trim()
                                            ? "Added"
                                            : "Empty"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                        SEO title
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {values.seoTitle.trim()
                                            ? "Added"
                                            : "Not set"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                        Featured image
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {featuredImage
                                            ? "Added"
                                            : "Not set"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-500">
                                        Attachments
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {attachments.length}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* FORM FOOTER */}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Save size={16} />

                        {isSubmitting
                            ? "Saving..."
                            : "Save Page"}
                    </button>
                </div>
            </form>

            {/* FEATURED IMAGE PICKER */}

            <MediaPicker
                open={isMediaPickerOpen}
                onClose={() =>
                    setIsMediaPickerOpen(false)
                }
                onSelect={handleFeaturedImageSelect}
                type="image"
            />

            {/* ATTACHMENT PICKER */}

            <MediaPicker
                open={isAttachmentPickerOpen}
                onClose={() =>
                    setIsAttachmentPickerOpen(false)
                }
                onSelect={handleAttachmentSelect}
                type="document"
            />
        </>
    );
}
