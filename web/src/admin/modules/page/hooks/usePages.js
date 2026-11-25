import { useQuery } from "@tanstack/react-query";
import pageApi from "../api/pageApi";

export const pageKeys = {
    all: ["pages"],

    lists: () => [...pageKeys.all, "list"],

    list: (filters) => [
        ...pageKeys.lists(),
        filters,
    ],

    details: () => [...pageKeys.all, "detail"],

    detail: (uuid) => [
        ...pageKeys.details(),
        uuid,
    ],
};

export default function usePages(params = {}) {
    return useQuery({
        queryKey: pageKeys.list(params),

        queryFn: () => pageApi.getAll(params),

        placeholderData: (previousData) => previousData,

        staleTime: 60 * 1000,
    });
}