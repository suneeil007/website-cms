import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageForm from "../components/PageForm";
import useCreatePage from "../hooks/useCreatePage";
import api from "@/services/axios";

function getCreatedPageUuid(response) {
    return (
        response?.data?.data?.uuid ||
        response?.data?.uuid ||
        response?.data?.data?.page?.uuid ||
        response?.data?.page?.uuid ||
        response?.data?.uuid ||
        response?.uuid ||
        null
    );
}

async function attachMedia(pageUuid, mediaUuid, role, sortOrder = 0) {
    await api.post(`/media/${mediaUuid}/attach`, {
        pageUuid,
        role,
        sortOrder,
    });
}

export default function PageCreatePage() {
    const navigate = useNavigate();
    const createMutation = useCreatePage();

    const handleSubmit = async (payload) => {
        const {
            featuredMediaUuid,
            attachmentMediaUuids = [],
            ...pagePayload
        } = payload;

        let createdPageUuid = null;

        // Step 1: Create the page.
        try {
            const response = await createMutation.mutateAsync(pagePayload);

            createdPageUuid = getCreatedPageUuid(response);

            if (!createdPageUuid) {
                toast.error(
                    "Page was created, but its UUID could not be read. Please check the page list."
                );

                navigate("/admin/pages");
                return;
            }
        } catch (error) {
            // The mutation hook may already display the error notification.
            console.error("Page creation failed:", error);
            return;
        }

        // Step 2: Attach featured image and files.
        try {
            if (featuredMediaUuid) {
                await attachMedia(
                    createdPageUuid,
                    featuredMediaUuid,
                    "FEATURED_IMAGE",
                    0
                );
            }

            for (let index = 0; index < attachmentMediaUuids.length; index++) {
                const mediaUuid = attachmentMediaUuids[index];

                await attachMedia(
                    createdPageUuid,
                    mediaUuid,
                    "ATTACHMENT",
                    index
                );
            }

            toast.success("Page created successfully.");
        } catch (error) {
            console.error(
                "Page created, but media attachment failed:",
                error.response?.data || error
            );

            toast.error(
                "Page was created, but one or more media files could not be attached. You can edit the page and try again."
            );
        }

        navigate("/admin/pages");
    };

    return (
        <PageForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            onCancel={() => navigate("/admin/pages")}
        />
    );
}