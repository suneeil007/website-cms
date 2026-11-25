
import { useEffect, useState } from "react";

import {
    X,
    Save,
    Trash2,
    FileText,
    Calendar,
    HardDrive,
    Link2,
    Loader2,
} from "lucide-react";

import { toast } from "sonner";

import {
    useMediaDetails,
    useUpdateMedia,
    useDeleteMedia,
} from "../hooks/useMedia";

import MediaPreview from "./MediaPreview";

function formatFileSize(bytes) {
    const size = Number(bytes) || 0;

    if (size < 1024) return `${size} Bytes`;

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaDetails({
    uuid,
    onClose,
    onDeleted,
}) {
    const {
        data: media,
        isLoading,
        isError,
    } = useMediaDetails(uuid);

    const updateMutation = useUpdateMedia();
    const deleteMutation = useDeleteMedia();

    const [form, setForm] = useState({
        altText: "",
        caption: "",
    });

    useEffect(() => {
        if (media) {
            setForm({
                altText: media.altText ?? "",
                caption: media.caption ?? "",
            });
        }
    }, [media]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            await updateMutation.mutateAsync({
                uuid,
                payload: {
                    altText: form.altText,
                    caption: form.caption,
                },
            });

            toast.success("Media details updated.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update media."
            );
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(
            "Are you sure you want to permanently delete this file?"
        )) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(uuid);

            toast.success("Media deleted successfully.");

            onDeleted?.(uuid);
            onClose?.();

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to delete media."
            );
        }
    };

    if (!uuid) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">

            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-background shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b p-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Media Details
                        </h2>

                        <p className="text-xs text-muted-foreground">
                            View and edit media information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}

                <div className="flex-1 space-y-6 overflow-y-auto p-5">

                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}

                    {isError && (
                        <p className="text-sm text-destructive">
                            Unable to load media details.
                        </p>
                    )}

                    {media && (
                        <>
                            {/* Preview */}

                            <MediaPreview
                                media={media}
                                className="aspect-video w-full rounded-xl"
                                imageClassName="h-full w-full object-contain"
                            />

                            {/* File Information */}

                            <div className="space-y-3 rounded-xl border p-4">

                                <h3 className="font-semibold">
                                    File Information
                                </h3>

                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" />

                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Filename
                                        </p>

                                        <p className="break-all font-medium">
                                            {media.originalName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <HardDrive className="h-4 w-4 text-muted-foreground" />

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            File size
                                        </p>

                                        <p className="font-medium">
                                            {formatFileSize(media.size)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Uploaded
                                        </p>

                                        <p className="font-medium">
                                            {media.createdAt
                                                ? new Date(media.createdAt).toLocaleString()
                                                : "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Link2 className="h-4 w-4 text-muted-foreground" />

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Used by pages
                                        </p>

                                        <p className="font-medium">
                                            {media.usageCount ?? 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        MIME Type
                                    </p>

                                    <p className="mt-1 break-all text-sm">
                                        {media.mimeType}
                                    </p>
                                </div>

                            </div>

                            {/* Metadata Form */}

                            <form
                                onSubmit={handleSave}
                                className="space-y-4"
                            >
                                <h3 className="font-semibold">
                                    Edit Metadata
                                </h3>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Alternative Text
                                    </label>

                                    <input
                                        type="text"
                                        name="altText"
                                        value={form.altText}
                                        onChange={handleChange}
                                        placeholder="Describe the image"
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    />

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Useful for accessibility and SEO.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Caption
                                    </label>

                                    <textarea
                                        name="caption"
                                        value={form.caption}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Enter media caption"
                                        className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}

                                    Save Changes
                                </button>
                            </form>
                        </>
                    )}

                </div>

                {/* Footer */}

                {media && (
                    <div className="border-t p-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}

                            Delete Media
                        </button>

                        {media.usageCount > 0 && (
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                This file is attached to {media.usageCount} page(s).
                            </p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
