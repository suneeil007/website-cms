
import { useQuery } from "@tanstack/react-query";

import pageApi from "../api/pageApi";
import { pageKeys } from "./usePages";

export default function usePage(uuid) {
    return useQuery({
        queryKey: pageKeys.detail(uuid),

        queryFn: () => pageApi.getByUuid(uuid),

        enabled: Boolean(uuid),

        staleTime: 0,

        refetchOnMount: "always",
    });
}
