
import {
    FileText,
    Newspaper,
    FolderTree,
    Image,
    Users,
    RefreshCw,
} from "lucide-react";

import StatsCard from "./components/StatsCard";
import RecentActivity from "./components/RecentActivity";
import ContentOverview from "./components/ContentOverview";
import useDashboard from "./hooks/useDashboard";

export default function DashboardPage() {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useDashboard();

    const statistics = data?.statistics ?? {};

    const stats = [
        {
            title: "Published Pages",
            value: statistics.publishedPages ?? 0,
            description: "Published website pages",
            icon: FileText,
        },
        {
            title: "News Articles",
            value: statistics.newsArticles ?? 0,
            description: "Total news articles",
            icon: Newspaper,
        },
        {
            title: "Categories",
            value: statistics.categories ?? 0,
            description: "Available categories",
            icon: FolderTree,
        },
        {
            title: "Media Files",
            value: statistics.mediaFiles ?? 0,
            description: "Uploaded media files",
            icon: Image,
        },
        {
            title: "Administrators",
            value: statistics.administrators ?? 0,
            description: "Registered administrators",
            icon: Users,
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6 p-6 animate-pulse">
                <div className="h-8 w-64 rounded bg-gray-200" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 rounded-xl bg-gray-200"
                        />
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="h-80 rounded-xl bg-gray-200" />
                    <div className="h-80 rounded-xl bg-gray-200" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <h2 className="font-semibold text-red-700">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong."}
                    </p>

                    <button
                        onClick={() => refetch()}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your website and content activity.
                    </p>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={isFetching ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((stat) => (
                    <StatsCard
                        key={stat.title}
                        {...stat}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ContentOverview
                    statistics={statistics}
                />

                <RecentActivity
                    activities={data?.recentActivity ?? []}
                />
            </div>
        </div>
    );
}
