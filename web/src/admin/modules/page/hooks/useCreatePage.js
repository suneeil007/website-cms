import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import pageApi from "../api/pageApi";
import { pageKeys } from "./usePages";

export default function useCreatePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: pageApi.create,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: pageKeys.all,
            });

            toast.success("Page created successfully.");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to create page."
            );
        },
    });
}