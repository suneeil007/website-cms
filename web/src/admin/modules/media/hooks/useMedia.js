
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getMedia,
    getMediaByUuid,
    uploadMedia,
    updateMedia,
    attachMediaToPage,
    deleteMedia,
} from "../api/mediaApi";

export const mediaKeys = {
    all: ["media"],

    lists: () => ["media", "list"],

    list: (params) => ["media", "list", params],

    details: () => ["media", "detail"],

    detail: (uuid) => ["media", "detail", uuid],
};

// MEDIA LIST
export function useMedia(params = {}) {
    return useQuery({
        queryKey: mediaKeys.list(params),
        queryFn: () => getMedia(params),
        placeholderData: (previousData) => previousData,
    });
}

// MEDIA DETAILS
export function useMediaDetails(uuid) {
    return useQuery({
        queryKey: mediaKeys.detail(uuid),
        queryFn: () => getMediaByUuid(uuid),
        enabled: Boolean(uuid),
    });
}

// UPLOAD MEDIA
export function useUploadMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadMedia,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: mediaKeys.all,
            });
        },
    });
}

// UPDATE MEDIA
export function useUpdateMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uuid, payload }) =>
            updateMedia(uuid, payload),

        onSuccess: (media) => {
            queryClient.invalidateQueries({
                queryKey: mediaKeys.lists(),
            });

            queryClient.setQueryData(
                mediaKeys.detail(media.uuid),
                media
            );
        },
    });
}

// ATTACH MEDIA
export function useAttachMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uuid, payload }) =>
            attachMediaToPage(uuid, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: mediaKeys.all,
            });

            queryClient.invalidateQueries({
                queryKey: ["pages"],
            });
        },
    });
}

// DELETE MEDIA
export function useDeleteMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMedia,

        onSuccess: (_, uuid) => {
            queryClient.invalidateQueries({
                queryKey: mediaKeys.all,
            });

            queryClient.removeQueries({
                queryKey: mediaKeys.detail(uuid),
            });
        },
    });
}
