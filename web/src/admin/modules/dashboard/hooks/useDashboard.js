import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../api/dashboardApi";

export const dashboardKeys = {
    all: ["dashboard"],
    overview: () => [...dashboardKeys.all, "overview"],
};

export default function useDashboard() {
    return useQuery({
        queryKey: dashboardKeys.overview(),
        queryFn: dashboardApi.getOverview,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
    });
}