
import { useNavigate, useParams } from "react-router-dom";

import {
    AlertCircle,
    ArrowLeft,
    LoaderCircle,
} from "lucide-react";

import { toast } from "sonner";

import api from "@/services/axios";

import PageForm from "../components/PageForm";
import usePage from "../hooks/usePage";
import useUpdatePage from "../hooks/useUpdatePage";

// ==========================================
// MEDIA HELPERS
// ==========================================

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
        .filter((item) => {
            return (
                String(item?.role || "").toUpperCase() ===
                "ATTACHMENT"
            );
        })
        .map(getMediaRecord)
        .filter((media) => media?.uuid)
        .sort(
            (a, b) =>
                Number(a.sortOrder ?? a.sort_order ?? 0) -
                Number(b.sortOrder ?? b.sort_order ?? 0)
        );
}

// ==========================================
// MEDIA API
// ==========================================

async function attachMedia(
    pageUuid,
    mediaUuid,
    role,
    sortOrder = 0
) {
    return api.post(`/media/${mediaUuid}/attach`, {
        pageUuid,
        role,
        sortOrder,
    });
}

async function detachMedia(pageUuid, mediaUuid) {
    return api.delete(`/media/${mediaUuid}/detach`, {
        data: {
            pageUuid,
        },
    });
}

// ==========================================
// PAGE EDIT
// ==========================================

export default function PageEditPage() {
    const navigate = useNavigate();

    const { uuid } = useParams();

    const {
        data,
        isLoading,
        isError,
        error,
    } = usePage(uuid);

    const updateMutation = useUpdatePage();

    // Support common API response structures.
    const page =
        data?.data?.data ||
        data?.data ||
        data;

    // ======================================
    // SUBMIT
    // ======================================

    const handleSubmit = async (payload) => {
        if (!page?.uuid) {
            toast.error(
                "Page information is not available."
            );

            return;
        }

        const {
            featuredMediaUuid,
            attachmentMediaUuids = [],
            ...pagePayload
        } = payload;

        const pageUuid = page.uuid;

        // Existing media.
        const previousFeaturedMediaUuid =
            getFeaturedMedia(page)?.uuid || null;

        const previousAttachmentUuids =
            getPageAttachments(page).map(
                (media) => media.uuid
            );

        // Selected media.
        const nextFeaturedMediaUuid =
            featuredMediaUuid || null;

        const nextAttachmentUuids = [
            ...new Set(
                attachmentMediaUuids.filter(Boolean)
            ),
        ].filter(
            (mediaUuid) =>
                mediaUuid !== nextFeaturedMediaUuid
        );

        // ==================================
        // DETERMINE CHANGES
        // ==================================

        const featuredChanged =
            previousFeaturedMediaUuid !==
            nextFeaturedMediaUuid;

        const attachmentsToAdd =
            nextAttachmentUuids.filter(
                (mediaUuid) =>
                    !previousAttachmentUuids.includes(
                        mediaUuid
                    )
            );

        const attachmentsToRemove =
            previousAttachmentUuids.filter(
                (mediaUuid) =>
                    !nextAttachmentUuids.includes(
                        mediaUuid
                    )
            );

        // Track new relationships for rollback.
        const newlyAttachedMedia = [];

        // ==================================
        // STEP 1: ATTACH NEW MEDIA
        // ==================================

        try {
            if (
                nextFeaturedMediaUuid &&
                featuredChanged
            ) {
                await attachMedia(
                    pageUuid,
                    nextFeaturedMediaUuid,
                    "FEATURED_IMAGE",
                    0
                );

                newlyAttachedMedia.push(
                    nextFeaturedMediaUuid
                );
            }

            for (
                let index = 0;
                index < nextAttachmentUuids.length;
                index++
            ) {
                const mediaUuid =
                    nextAttachmentUuids[index];

                if (
                    !attachmentsToAdd.includes(
                        mediaUuid
                    )
                ) {
                    continue;
                }

                await attachMedia(
                    pageUuid,
                    mediaUuid,
                    "ATTACHMENT",
                    index
                );

                newlyAttachedMedia.push(mediaUuid);
            }
        } catch (attachError) {
            console.error(
                "New media attachment failed:",
                attachError.response?.data ||
                    attachError
            );

            // Rollback newly attached relationships.
            for (const mediaUuid of newlyAttachedMedia) {
                try {
                    await detachMedia(
                        pageUuid,
                        mediaUuid
                    );
                } catch (rollbackError) {
                    console.error(
                        "Media rollback failed:",
                        rollbackError
                    );
                }
            }

            toast.error(
                "Unable to attach the selected media files."
            );

            return;
        }

        // ==================================
        // STEP 2: UPDATE PAGE
        // ==================================

        try {
            await updateMutation.mutateAsync({
                uuid: pageUuid,
                payload: pagePayload,
            });
        } catch (updateError) {
            console.error(
                "Page update failed:",
                updateError
            );

            // Rollback new media relationships.
            for (const mediaUuid of newlyAttachedMedia) {
                try {
                    await detachMedia(
                        pageUuid,
                        mediaUuid
                    );
                } catch (rollbackError) {
                    console.error(
                        "Media rollback failed:",
                        rollbackError
                    );
                }
            }

            return;
        }

        // ==================================
        // STEP 3: REMOVE OLD MEDIA
        // ==================================

        const mediaToRemove = [
            ...(featuredChanged &&
            previousFeaturedMediaUuid
                ? [previousFeaturedMediaUuid]
                : []),

            ...attachmentsToRemove,
        ];

        let detachFailed = false;

        for (const mediaUuid of mediaToRemove) {
            try {
                await detachMedia(
                    pageUuid,
                    mediaUuid
                );
            } catch (detachError) {
                detachFailed = true;

                console.error(
                    `Unable to detach media ${mediaUuid}:`,
                    detachError.response?.data ||
                        detachError
                );
            }
        }

        // ==================================
        // SUCCESS
        // ==================================

        if (detachFailed) {
            toast.warning(
                "Page updated, but some old media files could not be detached."
            );
        } else {
            toast.success("Page updated successfully.");
        }

        navigate("/admin/pages", {
            replace: true,
        });

        navigate("/admin/pages");
    };

    // ======================================
    // LOADING
    // ======================================

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LoaderCircle
                        size={20}
                        className="animate-spin"
                    />

                    Loading page...
                </div>
            </div>
        );
    }

    // ======================================
    // ERROR
    // ======================================

    if (isError || !page) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle
                        size={22}
                        className="mt-0.5 text-red-600"
                    />

                    <div>
                        <h2 className="font-semibold text-red-800">
                            Unable to load page
                        </h2>

                        <p className="mt-1 text-sm text-red-700">
                            {error?.message ||
                                "The requested page could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/pages")
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                            <ArrowLeft size={16} />

                            Back to pages
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ======================================
    // FORM
    // ======================================

    return (
        <PageForm
            initialData={page}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() =>
                navigate("/admin/pages")
            }
        />
    );
}
