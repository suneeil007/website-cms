import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import pageApi from "../api/pageApi";
import { pageKeys } from "./usePages";

export default function useDeletePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: pageApi.delete,

        onSuccess: (_, uuid) => {
            queryClient.invalidateQueries({
                queryKey: pageKeys.all,
            });

            queryClient.removeQueries({
                queryKey: pageKeys.detail(uuid),
            });

            toast.success("Page deleted successfully.");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete page."
            );
        },
    });
}