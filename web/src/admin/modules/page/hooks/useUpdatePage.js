
import { useMutation, useQueryClient } from "@tanstack/react-query";

import pageApi from "../api/pageApi";
import { pageKeys } from "./usePages";

export default function useUpdatePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uuid, payload }) =>
            pageApi.update(uuid, payload),

        onSuccess: async (_updatedPage, variables) => {
            // Refresh all page queries.
            await queryClient.invalidateQueries({
                queryKey: pageKeys.all,
            });

            // Explicitly fetch the latest page data.
            await queryClient.refetchQueries({
                queryKey: pageKeys.detail(variables.uuid),
                exact: true,
            });
        },

        onError: (error) => {
            console.error(
                "Page update failed:",
                error.response?.data || error
            );
        },
    });
}
